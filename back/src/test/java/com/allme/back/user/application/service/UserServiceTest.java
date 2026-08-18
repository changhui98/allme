package com.allme.back.user.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.allme.back.file.FileTestStubs.InMemoryUploadFileRepository;
import com.allme.back.file.FileTestStubs.InMemoryUploadTempFileRepository;
import com.allme.back.file.FileTestStubs.RecordingFileStorage;
import com.allme.back.file.application.service.FileService;
import com.allme.back.file.domain.FilePurpose;
import com.allme.back.global.crypto.HmacSha256Hasher;
import com.allme.back.global.exception.AppException;
import com.allme.back.user.application.port.IdentityVerificationPort.IdentityVerificationResult;
import com.allme.back.user.application.port.WithdrawnUserArchivePort;
import com.allme.back.user.application.port.WithdrawnUserArchivePort.WithdrawnUser;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserRepository;
import java.time.Clock;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class UserServiceTest {

    private static final String TEST_HMAC_KEY =
        Base64.getEncoder().encodeToString("0123456789abcdef0123456789abcdef".getBytes());

    private static final String VALID_PASSWORD = "Abcdef1!";

    /** 스텁 저장소들로 조립한 실제 FileService — 프록시가 없어 REQUIRES_NEW·afterCommit은 폴백 경로로 동작 */
    private final InMemoryUploadFileRepository fileRepository = new InMemoryUploadFileRepository();
    private final InMemoryUploadTempFileRepository tempRepository =
        new InMemoryUploadTempFileRepository();
    private final RecordingFileStorage fileStorage = new RecordingFileStorage();
    private final FileService fileService = new FileService(
        fileRepository, tempRepository, fileStorage, Clock.system(ZoneId.of("Asia/Seoul")));
    private final StubWithdrawnUserArchive stubArchive = new StubWithdrawnUserArchive();

    private UserService serviceWith(boolean loginIdExists) {
        return serviceWith(loginIdExists, false, null);
    }

    private UserService serviceWith(boolean loginIdExists, boolean ciExists) {
        return serviceWith(loginIdExists, ciExists, null);
    }

    private UserService serviceWith(
        boolean loginIdExists, boolean ciExists, User existingUser
    ) {
        UserRepository stubRepository = new UserRepository() {
            @Override
            public boolean existsByLoginId(String loginId) {
                return loginIdExists;
            }

            @Override
            public boolean existsByCiHash(String ciHash) {
                return ciExists;
            }

            @Override
            public java.util.Optional<User> findById(Long id) {
                return java.util.Optional.ofNullable(existingUser);
            }

            @Override
            public java.util.Optional<User> findByLoginId(String loginId) {
                return java.util.Optional.ofNullable(existingUser);
            }

            @Override
            public User save(User user) {
                return user;
            }
        };
        HmacSha256Hasher hasher = new HmacSha256Hasher(TEST_HMAC_KEY);
        IdentityVerificationService stubVerification = new IdentityVerificationService(
            id -> new IdentityVerificationResult(
                "VERIFIED", "홍길동", "1998-01-02", "01012345678", "MALE", "ci-value", "di-value"),
            stubRepository, hasher);
        return new UserService(
            stubRepository, stubVerification, new BCryptPasswordEncoder(), hasher,
            fileService, stubArchive, Clock.system(ZoneId.of("Asia/Seoul")));
    }

    /** 이관 호출을 기록하는 스텁 아카이브 — failNext로 아카이브 장애를 흉내낸다 */
    private static class StubWithdrawnUserArchive implements WithdrawnUserArchivePort {

        final List<WithdrawnUser> archived = new ArrayList<>();
        boolean failNext = false;

        @Override
        public void archive(WithdrawnUser data) {
            if (failNext) {
                throw new IllegalStateException("archive db down");
            }
            archived.add(data);
        }

    }

    /** 파일 테이블에 기존 프로필 이미지 레코드를 심고 user에 연결한다. 반환값은 파일 id. */
    private Long seedProfileImage(User user, String originalName) {
        Long fileId = fileService.promote(
            fileService.createTemp(FilePurpose.PROFILE, originalName, 1L, "png", 1L).getId());
        user.changeProfileImageFile(fileId);
        return fileId;
    }

    @Test
    @DisplayName("형식에 맞고 미사용 아이디면 사용 가능(true)을 반환한다")
    void available() {
        assertThat(serviceWith(false).isLoginIdAvailable("allme123")).isTrue();
    }

    @Test
    @DisplayName("이미 존재하는 아이디면 사용 불가(false)를 반환한다")
    void taken() {
        assertThat(serviceWith(true).isLoginIdAvailable("allme123")).isFalse();
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"Allme123", "abc", "a23456789012345678901", "allme_1", "한글아이디"})
    @DisplayName("null·대문자·3자·21자·특수문자·한글이면 LOGIN_ID_INVALID_FORMAT 예외를 던진다")
    void invalidFormat(String loginId) {
        assertThatThrownBy(() -> serviceWith(false).isLoginIdAvailable(loginId))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.LOGIN_ID_INVALID_FORMAT);
    }

    @Test
    @DisplayName("가입 성공 시 loginId를 반환한다")
    void join_success() {
        assertThat(serviceWith(false).join("iv-1", "allme123", VALID_PASSWORD, true))
            .isEqualTo("allme123");
    }

    @Test
    @DisplayName("이미 존재하는 아이디로 가입하면 LOGIN_ID_DUPLICATED 예외를 던진다")
    void join_duplicatedLoginId() {
        assertThatThrownBy(() -> serviceWith(true).join("iv-1", "allme123", VALID_PASSWORD, true))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.LOGIN_ID_DUPLICATED);
    }

    @Test
    @DisplayName("같은 CI로 이미 가입된 계정이 있으면 ALREADY_REGISTERED 예외를 던진다")
    void join_alreadyRegistered() {
        assertThatThrownBy(
            () -> serviceWith(false, true).join("iv-1", "allme123", VALID_PASSWORD, true))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.ALREADY_REGISTERED);
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {
        "Abc1!",        // 8자 미만
        "abcdef1!",     // 대문자 없음
        "ABCDEF1!",     // 소문자 없음
        "Abcdefg!",     // 숫자 없음
        "Abcdefg1",     // 특수문자 없음
    })
    @DisplayName("규칙(8~64자·대/소문자·숫자·특수문자)에 어긋난 비밀번호면 PASSWORD_INVALID_FORMAT 예외를 던진다")
    void join_invalidPassword(String password) {
        assertThatThrownBy(() -> serviceWith(false).join("iv-1", "allme123", password, true))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.PASSWORD_INVALID_FORMAT);
    }

    private User userWithPassword(String rawPassword) {
        return User.create(
            "allme123", new BCryptPasswordEncoder().encode(rawPassword),
            "홍길동", "ci-value", "ci-hash", null, "01012345678", true);
    }

    @Test
    @DisplayName("아이디·비밀번호가 맞으면 회원을 반환한다")
    void login_success() {
        User user = userWithPassword(VALID_PASSWORD);

        assertThat(serviceWith(true, false, user).login("allme123", VALID_PASSWORD))
            .isSameAs(user);
    }

    @Test
    @DisplayName("존재하지 않는 아이디면 LOGIN_FAILED 예외를 던진다")
    void login_unknownLoginId() {
        assertThatThrownBy(() -> serviceWith(false).login("nouser1", VALID_PASSWORD))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.LOGIN_FAILED);
    }

    @Test
    @DisplayName("비밀번호가 틀리면 LOGIN_FAILED 예외를 던진다")
    void login_wrongPassword() {
        User user = userWithPassword(VALID_PASSWORD);

        assertThatThrownBy(
            () -> serviceWith(true, false, user).login("allme123", "Wrong999!"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.LOGIN_FAILED);
    }

    @Test
    @DisplayName("탈퇴한 회원이면 비밀번호가 맞아도 LOGIN_FAILED 예외를 던진다")
    void login_deletedUser() {
        User user = userWithPassword(VALID_PASSWORD);
        user.delete();

        assertThatThrownBy(
            () -> serviceWith(true, false, user).login("allme123", VALID_PASSWORD))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.LOGIN_FAILED);
    }

    @Test
    @DisplayName("세션 userId로 회원을 조회한다")
    void getById_success() {
        User user = userWithPassword(VALID_PASSWORD);

        assertThat(serviceWith(true, false, user).getById(1L)).isSameAs(user);
    }

    @Test
    @DisplayName("없는 회원이거나 탈퇴한 회원이면 UNAUTHORIZED 예외를 던진다")
    void getById_unauthorized() {
        User deleted = userWithPassword(VALID_PASSWORD);
        deleted.delete();

        assertThatThrownBy(() -> serviceWith(false).getById(1L))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.UNAUTHORIZED);
        assertThatThrownBy(() -> serviceWith(true, false, deleted).getById(1L))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.UNAUTHORIZED);
    }

    @Test
    @DisplayName("프로필 이미지 업로드 시 파일 테이블에 승격되고 임시 테이블은 비며 엔티티가 파일 id를 참조한다")
    void updateProfileImage_success() {
        User user = userWithPassword(VALID_PASSWORD);

        Long fileId = serviceWith(true, false, user)
            .updateProfileImage(1L, new byte[] {1, 2, 3}, "PNG", "내사진.PNG");

        assertThat(user.getProfileImageFileId()).isEqualTo(fileId);
        assertThat(fileRepository.store.get(fileId).getOriginalName()).isEqualTo("내사진.PNG");
        assertThat(fileRepository.store.get(fileId).getStoredPath())
            .matches("profile/profile_\\d{14}_[a-z0-9]{6}\\.png");
        assertThat(tempRepository.store).isEmpty();
        assertThat(fileStorage.deleted).isEmpty();
    }

    @Test
    @DisplayName("기존 이미지가 있으면 새 파일로 교체되고 기존 파일 레코드와 디스크 파일이 삭제된다")
    void updateProfileImage_replacesPrevious() {
        User user = userWithPassword(VALID_PASSWORD);
        Long oldFileId = seedProfileImage(user, "old.png");
        String oldPath = fileRepository.store.get(oldFileId).getStoredPath();

        Long newFileId = serviceWith(true, false, user)
            .updateProfileImage(1L, new byte[] {1}, "jpg", "새사진.jpg");

        assertThat(user.getProfileImageFileId()).isEqualTo(newFileId);
        assertThat(fileRepository.store).containsOnlyKeys(newFileId);
        assertThat(fileStorage.deleted).containsExactly(oldPath);
    }

    @Test
    @DisplayName("허용되지 않는 확장자거나 내용이 비어 있으면 PROFILE_IMAGE_INVALID 예외를 던진다")
    void updateProfileImage_invalid() {
        User user = userWithPassword(VALID_PASSWORD);
        UserService service = serviceWith(true, false, user);

        assertThatThrownBy(() -> service.updateProfileImage(1L, new byte[] {1}, "gif", "a.gif"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.PROFILE_IMAGE_INVALID);
        assertThatThrownBy(() -> service.updateProfileImage(1L, new byte[0], "png", "a.png"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.PROFILE_IMAGE_INVALID);
        assertThat(fileStorage.files).isEmpty();
        assertThat(tempRepository.store).isEmpty();
    }

    @Test
    @DisplayName("탈퇴하면 아카이브로 이관한 뒤 본 DB에는 loginId·삭제일만 남고 개인정보·이미지가 비워진다")
    void withdraw_success() {
        User user = userWithPassword(VALID_PASSWORD);
        Long fileId = seedProfileImage(user, "old.png");
        String storedPath = fileRepository.store.get(fileId).getStoredPath();

        serviceWith(true, false, user).withdraw(1L);

        // 아카이브에 원본 스냅샷 이관 (password는 이관 대상 아님 — record에 필드 자체가 없음)
        assertThat(stubArchive.archived).hasSize(1);
        WithdrawnUser archived = stubArchive.archived.get(0);
        assertThat(archived.loginId()).isEqualTo("allme123");
        assertThat(archived.name()).isEqualTo("홍길동");
        assertThat(archived.ci()).isEqualTo("ci-value");
        assertThat(archived.ciHash()).isEqualTo("ci-hash");
        assertThat(archived.phoneNumber()).isEqualTo("01012345678");

        // 본 DB에는 개인정보가 남지 않는다
        assertThat(user.isDeleted()).isTrue();
        assertThat(user.getLoginId()).isEqualTo("allme123");
        assertThat(user.getPassword()).isNull();
        assertThat(user.getName()).isNull();
        assertThat(user.getCi()).isNull();
        assertThat(user.getCiHash()).isNull();
        assertThat(user.getDi()).isNull();
        assertThat(user.getPhoneNumber()).isNull();
        assertThat(user.getProfileImageFileId()).isNull();
        assertThat(fileRepository.store).isEmpty();
        assertThat(fileStorage.deleted).containsExactly(storedPath);
    }

    @Test
    @DisplayName("아카이브 이관이 실패하면 탈퇴가 중단되고 본 DB 원본이 그대로 남는다")
    void withdraw_archiveFailure() {
        User user = userWithPassword(VALID_PASSWORD);
        stubArchive.failNext = true;

        assertThatThrownBy(() -> serviceWith(true, false, user).withdraw(1L))
            .isInstanceOf(IllegalStateException.class);

        assertThat(user.isDeleted()).isFalse();
        assertThat(user.getName()).isEqualTo("홍길동");
        assertThat(user.getCi()).isEqualTo("ci-value");
        assertThat(user.getPassword()).isNotNull();
    }

    @Test
    @DisplayName("이미 탈퇴한 회원이 다시 탈퇴 요청하면 UNAUTHORIZED 예외를 던진다")
    void withdraw_alreadyWithdrawn() {
        User user = userWithPassword(VALID_PASSWORD);
        user.delete();

        assertThatThrownBy(() -> serviceWith(true, false, user).withdraw(1L))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.UNAUTHORIZED);
    }

    @Test
    @DisplayName("65자 비밀번호면 PASSWORD_INVALID_FORMAT 예외를 던진다")
    void join_tooLongPassword() {
        String tooLong = "Aa1!" + "a".repeat(61);

        assertThatThrownBy(() -> serviceWith(false).join("iv-1", "allme123", tooLong, true))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.PASSWORD_INVALID_FORMAT);
    }

}
