package com.allme.back.user.application.service;

import com.allme.back.file.application.service.FileService;
import com.allme.back.file.domain.FilePurpose;
import com.allme.back.file.domain.entity.UploadTempFile;
import com.allme.back.global.crypto.HmacSha256Hasher;
import com.allme.back.global.exception.AppException;
import com.allme.back.user.application.port.IdentityVerificationPort.IdentityVerificationResult;
import com.allme.back.user.application.port.WithdrawnUserArchivePort;
import com.allme.back.user.application.port.WithdrawnUserArchivePort.WithdrawnSettlementAccount;
import com.allme.back.user.application.port.WithdrawnUserArchivePort.WithdrawnUser;
import com.allme.back.user.domain.Bank;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Set;
import com.allme.back.user.domain.Role;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.entity.UserSettlementAccount;
import com.allme.back.user.domain.repository.UserRepository;
import com.allme.back.user.domain.repository.UserSettlementAccountRepository;
import java.util.Optional;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Pattern LOGIN_ID_PATTERN = Pattern.compile("^[a-z0-9]{4,20}$");

    /** front signup-validation.ts의 PASSWORD_RULES와 반드시 동일하게 유지할 것 */
    private static final Pattern PASSWORD_UPPER = Pattern.compile("[A-Z]");
    private static final Pattern PASSWORD_LOWER = Pattern.compile("[a-z]");
    private static final Pattern PASSWORD_DIGIT = Pattern.compile("[0-9]");
    private static final Pattern PASSWORD_SPECIAL = Pattern.compile("[^A-Za-z0-9\\s]");

    /**
     * 존재하지 않는 아이디일 때도 BCrypt 비교를 수행하기 위한 더미 해시.
     * 아이디 유무에 따라 응답 시간이 달라져 계정 존재가 노출되는 것(타이밍 공격)을 막는다.
     */
    private static final String DUMMY_PASSWORD_HASH = new BCryptPasswordEncoder().encode("dummy");

    /** 프로필 이미지로 허용하는 확장자 (소문자 기준) */
    private static final Set<String> PROFILE_IMAGE_EXTENSIONS =
        Set.of("jpg", "jpeg", "png", "webp");

    private final UserRepository userRepository;
    private final UserSettlementAccountRepository settlementAccountRepository;
    private final NicknameService nicknameService;
    private final IdentityVerificationService identityVerificationService;
    private final PasswordEncoder passwordEncoder;
    private final HmacSha256Hasher hmacSha256Hasher;
    /** file 도메인의 유스케이스 서비스 — user → file 단방향 의존만 허용(역방향 금지). */
    private final FileService fileService;
    private final WithdrawnUserArchivePort withdrawnUserArchivePort;
    private final Clock clock;

    /**
     * 아이디 형식(영문 소문자+숫자 4~20자)을 검증하고 사용 가능 여부를 반환한다.
     * 형식 검증을 서비스에서 하는 이유: @RequestParam 제약 위반(ConstraintViolationException)은
     * GlobalExceptionHandler가 처리하지 않아 500으로 떨어지기 때문.
     * 중복확인 통과 후 가입 사이의 선점(race)은 가입 API의 재검사 + DB unique 제약이 막는다.
     */
    public boolean isLoginIdAvailable(String loginId) {
        if (loginId == null || !LOGIN_ID_PATTERN.matcher(loginId).matches()) {
            throw new AppException(UserErrorCode.LOGIN_ID_INVALID_FORMAT);
        }
        return !userRepository.existsByLoginId(loginId);
    }

    /**
     * 회원가입. 프론트가 준 개인정보를 믿지 않고 identityVerificationId로
     * 포트원을 서버에서 재조회해 이름·CI·DI·휴대폰번호를 확보한다.
     * 중복가입 판정은 CI의 HMAC 해시 기준(암호문은 비결정적이라 검색 불가).
     * 비밀번호는 BCrypt 해시만 저장한다.
     */
    @Transactional
    public String join(
        String identityVerificationId, String loginId, String rawPassword, boolean marketingConsent
    ) {
        if (loginId == null || !LOGIN_ID_PATTERN.matcher(loginId).matches()) {
            throw new AppException(UserErrorCode.LOGIN_ID_INVALID_FORMAT);
        }
        if (userRepository.existsByLoginId(loginId)) {
            throw new AppException(UserErrorCode.LOGIN_ID_DUPLICATED);
        }
        if (!isPasswordValid(rawPassword)) {
            throw new AppException(UserErrorCode.PASSWORD_INVALID_FORMAT);
        }

        IdentityVerificationResult verification =
            identityVerificationService.verify(identityVerificationId);

        String ciHash = hmacSha256Hasher.hash(verification.ci());
        if (userRepository.existsByCiHash(ciHash)) {
            throw new AppException(UserErrorCode.ALREADY_REGISTERED);
        }

        User user = User.create(
            loginId,
            passwordEncoder.encode(rawPassword),
            verification.name(),
            nicknameService.generateUnique(),
            verification.ci(),
            ciHash,
            verification.di(),
            verification.phoneNumber(),
            marketingConsent
        );
        // 기본 역할 — cascade라 아래 save(saveAndFlush)에서 user_roles 행이 함께 INSERT된다
        user.grantRole(Role.USER);

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            // 사전 검사 통과 후 INSERT 사이의 race — unique 제약이 최종 방어선.
            // 어느 제약에 걸렸는지는 원인 메시지의 컬럼명으로 구분한다.
            // (nickname 충돌은 발급 직후 저장이라 실질 불가능 — 발생해도 재가입 시도로 해소)
            String cause = e.getMostSpecificCause().getMessage();
            throw new AppException(cause != null && cause.contains("login_id")
                ? UserErrorCode.LOGIN_ID_DUPLICATED
                : UserErrorCode.ALREADY_REGISTERED);
        }

        return user.getLoginId();
    }

    /**
     * 아이디·비밀번호를 검증하고 회원을 반환한다.
     * 실패 사유(미존재 아이디/비밀번호 불일치/탈퇴 회원)를 구분하지 않고
     * 모두 U010 하나로 응답한다 — 계정 존재 여부를 노출하지 않기 위함.
     */
    public User login(String loginId, String rawPassword) {
        if (loginId == null || rawPassword == null) {
            throw new AppException(UserErrorCode.LOGIN_FAILED);
        }

        User user = userRepository.findByLoginId(loginId).orElse(null);

        // 탈퇴 회원은 password가 null(아카이브 이관 후 파기) — 더미 해시로 비교해 타이밍 방어 유지
        String storedHash = user != null && user.getPassword() != null
            ? user.getPassword()
            : DUMMY_PASSWORD_HASH;
        boolean matches = passwordEncoder.matches(rawPassword, storedHash);

        if (user == null || !matches || user.isDeleted()) {
            throw new AppException(UserErrorCode.LOGIN_FAILED);
        }
        return user;
    }

    /** 세션의 userId로 회원을 조회한다. 탈퇴했거나 없는 회원이면 U011(로그인 필요). */
    public User getById(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(UserErrorCode.UNAUTHORIZED));
        if (user.isDeleted()) {
            throw new AppException(UserErrorCode.UNAUTHORIZED);
        }
        return user;
    }

    /**
     * 프로필 이미지 교체 — 임시 테이블 선기록 → 디스크 저장 → 정식 테이블 승격 순서.
     * 임시 레코드는 별도 트랜잭션으로 먼저 커밋되므로, 이후 어느 단계가 실패해도
     * 남은 임시 레코드를 청소 스케줄러가 디스크 파일과 함께 정리한다(정식 테이블 무오염).
     * 이전 파일의 레코드는 이 트랜잭션에서, 디스크 파일은 커밋 후에 삭제된다.
     *
     * @return 새 프로필 이미지 파일 id
     */
    @Transactional
    public Long updateProfileImage(
        Long userId, byte[] content, String extension, String originalFilename
    ) {
        if (content == null || content.length == 0
            || extension == null || !PROFILE_IMAGE_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new AppException(UserErrorCode.PROFILE_IMAGE_INVALID);
        }

        User user = getById(userId);
        Long previousFileId = user.getProfileImageFileId();

        UploadTempFile temp = fileService.createTemp(
            FilePurpose.PROFILE, originalFilename, content.length, extension.toLowerCase(), userId);
        fileService.storeContent(temp, content);
        Long newFileId = fileService.promote(temp.getId());

        user.changeProfileImageFile(newFileId);

        if (previousFileId != null) {
            fileService.remove(previousFileId);
        }
        return newFileId;
    }

    /** front lib/user.ts NICKNAME_RULES와 반드시 동일하게 유지할 것: 한글·영문·숫자·공백, 2~24자 */
    private static final Pattern NICKNAME_PATTERN = Pattern.compile("^[가-힣a-zA-Z0-9 ]{2,24}$");

    /**
     * 닉네임 변경 — trim·연속 공백 축약 후 형식(U014)·중복(U015) 검증.
     * 본인 닉네임과 같으면 no-op. 검사~커밋 사이 race는 unique 제약 catch로 U015.
     */
    @Transactional
    public User updateNickname(Long userId, String rawNickname) {
        String nickname = rawNickname == null
            ? ""
            : rawNickname.trim().replaceAll("\\s+", " ");
        if (!NICKNAME_PATTERN.matcher(nickname).matches()) {
            throw new AppException(UserErrorCode.NICKNAME_INVALID_FORMAT);
        }

        User user = getById(userId);
        if (nickname.equals(user.getNickname())) {
            return user;
        }
        if (userRepository.existsByNickname(nickname)) {
            throw new AppException(UserErrorCode.NICKNAME_DUPLICATED);
        }

        user.changeNickname(nickname);
        try {
            userRepository.save(user); // saveAndFlush — unique race를 여기서 잡는다
        } catch (DataIntegrityViolationException e) {
            throw new AppException(UserErrorCode.NICKNAME_DUPLICATED);
        }
        return user;
    }

    /** 랜덤 닉네임 제안 — 저장하지 않는다(저장은 updateNickname이 담당). */
    public String suggestNickname() {
        return nicknameService.generateUnique();
    }

    /** 마케팅 수신 동의 변경 — 변경 일시를 함께 기록한다. */
    @Transactional
    public User updateMarketingConsent(Long userId, boolean marketingConsent) {
        User user = getById(userId);
        user.changeMarketingConsent(marketingConsent);
        return user;
    }

    /** front lib/user.ts와 동기화: 하이픈 제거 후 숫자 8~16자리 */
    private static final Pattern ACCOUNT_NUMBER_PATTERN = Pattern.compile("^\\d{8,16}$");

    /** 정산 계좌 조회 — 미등록이면 empty. */
    public Optional<UserSettlementAccount> getSettlementAccount(Long userId) {
        return settlementAccountRepository.findByUserId(userId);
    }

    /**
     * 정산 계좌 등록/수정(upsert). 계좌번호는 하이픈·공백 제거 후 숫자 8~16자리로 정규화.
     * 형식·은행 오류는 U016 하나로 응답(형식별 안내는 프론트 검증이 1차 담당).
     */
    @Transactional
    public UserSettlementAccount saveSettlementAccount(
        Long userId, String bankName, String rawAccountNumber, String rawAccountHolder
    ) {
        Bank bank = parseBank(bankName);
        String accountNumber = rawAccountNumber == null
            ? ""
            : rawAccountNumber.replaceAll("[\\s-]", "");
        String accountHolder = rawAccountHolder == null ? "" : rawAccountHolder.trim();
        if (!ACCOUNT_NUMBER_PATTERN.matcher(accountNumber).matches()
            || accountHolder.isEmpty() || accountHolder.length() > 30) {
            throw new AppException(UserErrorCode.SETTLEMENT_ACCOUNT_INVALID);
        }

        getById(userId); // 활성 회원 확인

        return settlementAccountRepository.findByUserId(userId)
            .map(account -> {
                account.change(bank, accountNumber, accountHolder);
                return account;
            })
            .orElseGet(() -> settlementAccountRepository.save(
                UserSettlementAccount.create(userId, bank, accountNumber, accountHolder)));
    }

    private Bank parseBank(String bankName) {
        try {
            return Bank.valueOf(bankName);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new AppException(UserErrorCode.SETTLEMENT_ACCOUNT_INVALID);
        }
    }

    /** 프로필 이미지의 저장 상대경로 — 없으면 null. 응답 DTO의 URL 조합용. */
    public String getProfileImagePath(User user) {
        return user.getProfileImageFileId() != null
            ? fileService.getStoredPath(user.getProfileImageFileId())
            : null;
    }

    /**
     * 회원탈퇴 — 개인정보를 아카이브 DB(물리 분리)로 이관한 뒤 본 DB에서 비운다.
     * 본 DB에는 id·loginId·삭제일만 남는다(아이디 재사용 차단 유지, 같은 CI 재가입 가능).
     *
     * 순서가 원자성 방어의 핵심: 아카이브 포트는 자체 커넥션이라 호출 즉시 커밋되므로
     * (1) 아카이브 실패 → 전체 실패, 원본 무손실 (2) 아카이브 성공 후 본 트랜잭션 실패 →
     * 아카이브 잔여 행만 남고 원본 무손실(재시도는 userId upsert로 안전).
     * 어떤 실패 모드에서도 데이터가 유실되지 않는다.
     *
     * 실행 전 비밀번호 재확인(U013) — 방치된 세션의 오·악용으로 계정이 파괴되는 것을 막는다.
     */
    @Transactional
    public void withdraw(Long userId, String rawPassword) {
        User user = getById(userId);

        if (rawPassword == null || user.getPassword() == null
            || !passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new AppException(UserErrorCode.PASSWORD_MISMATCH);
        }

        withdrawnUserArchivePort.archive(new WithdrawnUser(
            user.getId(),
            user.getLoginId(),
            user.getName(),
            user.getCi(),
            user.getCiHash(),
            user.getDi(),
            user.getPhoneNumber(),
            user.isMarketingConsent(),
            user.getCreatedDate(),
            LocalDateTime.now(clock)
        ));

        // 정산 계좌 — 대금 지급 기록 보존을 위해 아카이브 이관 후 본 DB에서 파기
        settlementAccountRepository.findByUserId(userId).ifPresent(account -> {
            withdrawnUserArchivePort.archiveSettlementAccount(new WithdrawnSettlementAccount(
                userId,
                account.getBank().name(),
                account.getAccountNumber(),
                account.getAccountHolder(),
                LocalDateTime.now(clock)
            ));
            settlementAccountRepository.deleteByUserId(userId);
        });

        Long profileImageFileId = user.getProfileImageFileId();
        user.withdraw();

        if (profileImageFileId != null) {
            fileService.remove(profileImageFileId);
        }
    }

    private boolean isPasswordValid(String password) {
        return password != null
            && password.length() >= 8
            && password.length() <= 64
            && PASSWORD_UPPER.matcher(password).find()
            && PASSWORD_LOWER.matcher(password).find()
            && PASSWORD_DIGIT.matcher(password).find()
            && PASSWORD_SPECIAL.matcher(password).find();
    }

}
