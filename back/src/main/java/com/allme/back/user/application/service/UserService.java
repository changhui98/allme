package com.allme.back.user.application.service;

import com.allme.back.global.crypto.HmacSha256Hasher;
import com.allme.back.global.exception.AppException;
import com.allme.back.user.application.port.IdentityVerificationPort.IdentityVerificationResult;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserRepository;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
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

    private final UserRepository userRepository;
    private final IdentityVerificationService identityVerificationService;
    private final PasswordEncoder passwordEncoder;
    private final HmacSha256Hasher hmacSha256Hasher;

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
            verification.ci(),
            ciHash,
            verification.di(),
            verification.phoneNumber(),
            marketingConsent
        );

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            // 사전 검사 통과 후 INSERT 사이의 race — unique 제약이 최종 방어선.
            // 어느 제약에 걸렸는지는 원인 메시지의 컬럼명으로 구분한다.
            String cause = e.getMostSpecificCause().getMessage();
            throw new AppException(cause != null && cause.contains("login_id")
                ? UserErrorCode.LOGIN_ID_DUPLICATED
                : UserErrorCode.ALREADY_REGISTERED);
        }

        return user.getLoginId();
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
