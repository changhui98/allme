package com.allme.back.user.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.allme.back.global.crypto.HmacSha256Hasher;
import com.allme.back.global.exception.AppException;
import com.allme.back.user.application.port.IdentityVerificationPort;
import com.allme.back.user.application.port.IdentityVerificationPort.IdentityVerificationResult;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserRepository;
import java.util.Base64;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class IdentityVerificationServiceTest {

    private static final String TEST_HMAC_KEY =
        Base64.getEncoder().encodeToString("0123456789abcdef0123456789abcdef".getBytes());

    private IdentityVerificationService serviceWith(IdentityVerificationResult result) {
        return serviceWith(result, false);
    }

    private IdentityVerificationService serviceWith(
        IdentityVerificationResult result, boolean ciExists
    ) {
        IdentityVerificationPort stubPort = identityVerificationId -> result;
        UserRepository stubRepository = new UserRepository() {
            @Override
            public boolean existsByLoginId(String loginId) {
                return false;
            }

            @Override
            public boolean existsByCiHash(String ciHash) {
                return ciExists;
            }

            @Override
            public java.util.Optional<User> findById(Long id) {
                return java.util.Optional.empty();
            }

            @Override
            public java.util.Optional<User> findByLoginId(String loginId) {
                return java.util.Optional.empty();
            }

            @Override
            public User save(User user) {
                return user;
            }
        };
        return new IdentityVerificationService(
            stubPort, stubRepository, new HmacSha256Hasher(TEST_HMAC_KEY));
    }

    @Test
    @DisplayName("VERIFIED 상태면 인증 정보를 그대로 반환한다")
    void verify_success() {
        IdentityVerificationResult verified = new IdentityVerificationResult(
            "VERIFIED", "홍길동", "1998-01-02", "01012345678", "MALE", "ci-value", "di-value");

        IdentityVerificationResult result = serviceWith(verified).verify("identity-verification-1");

        assertThat(result.name()).isEqualTo("홍길동");
        assertThat(result.birthDate()).isEqualTo("1998-01-02");
        assertThat(result.isVerified()).isTrue();
    }

    @Test
    @DisplayName("READY 상태면 NOT_VERIFIED 예외를 던진다")
    void verify_ready() {
        IdentityVerificationResult ready = new IdentityVerificationResult(
            "READY", null, null, null, null, null, null);

        assertThatThrownBy(() -> serviceWith(ready).verify("identity-verification-1"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.IDENTITY_VERIFICATION_NOT_VERIFIED);
    }

    @Test
    @DisplayName("FAILED 상태면 NOT_VERIFIED 예외를 던진다")
    void verify_failed() {
        IdentityVerificationResult failed = new IdentityVerificationResult(
            "FAILED", null, null, null, null, null, null);

        assertThatThrownBy(() -> serviceWith(failed).verify("identity-verification-1"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.IDENTITY_VERIFICATION_NOT_VERIFIED);
    }

    @Test
    @DisplayName("VERIFIED라도 CI가 없으면(카카오 인증서 등) CI_UNAVAILABLE 예외를 던진다")
    void verify_ciUnavailable() {
        IdentityVerificationResult withoutCi = new IdentityVerificationResult(
            "VERIFIED", "홍길동", "1998-01-02", "01012345678", "MALE", null, null);

        assertThatThrownBy(() -> serviceWith(withoutCi).verify("identity-verification-1"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.IDENTITY_VERIFICATION_CI_UNAVAILABLE);
    }

    @Test
    @DisplayName("같은 CI로 이미 가입된 계정이 있으면 ALREADY_REGISTERED 예외를 던진다")
    void verify_alreadyRegistered() {
        IdentityVerificationResult verified = new IdentityVerificationResult(
            "VERIFIED", "홍길동", "1998-01-02", "01012345678", "MALE", "ci-value", "di-value");

        assertThatThrownBy(
            () -> serviceWith(verified, true).verify("identity-verification-1"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.ALREADY_REGISTERED);
    }

}
