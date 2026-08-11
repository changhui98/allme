package com.allme.back.user.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.allme.back.global.exception.AppException;
import com.allme.back.user.application.port.IdentityVerificationPort;
import com.allme.back.user.application.port.IdentityVerificationPort.IdentityVerificationResult;
import com.allme.back.user.domain.UserErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class IdentityVerificationServiceTest {

    private IdentityVerificationService serviceWith(IdentityVerificationResult result) {
        IdentityVerificationPort stubPort = identityVerificationId -> result;
        return new IdentityVerificationService(stubPort);
    }

    @Test
    @DisplayName("VERIFIED 상태면 인증 정보를 그대로 반환한다")
    void verify_success() {
        IdentityVerificationResult verified = new IdentityVerificationResult(
            "VERIFIED", "홍길동", "1998-01-02", "01012345678", "MALE", "ci-value");

        IdentityVerificationResult result = serviceWith(verified).verify("identity-verification-1");

        assertThat(result.name()).isEqualTo("홍길동");
        assertThat(result.birthDate()).isEqualTo("1998-01-02");
        assertThat(result.isVerified()).isTrue();
    }

    @Test
    @DisplayName("READY 상태면 NOT_VERIFIED 예외를 던진다")
    void verify_ready() {
        IdentityVerificationResult ready = new IdentityVerificationResult(
            "READY", null, null, null, null, null);

        assertThatThrownBy(() -> serviceWith(ready).verify("identity-verification-1"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.IDENTITY_VERIFICATION_NOT_VERIFIED);
    }

    @Test
    @DisplayName("FAILED 상태면 NOT_VERIFIED 예외를 던진다")
    void verify_failed() {
        IdentityVerificationResult failed = new IdentityVerificationResult(
            "FAILED", null, null, null, null, null);

        assertThatThrownBy(() -> serviceWith(failed).verify("identity-verification-1"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.IDENTITY_VERIFICATION_NOT_VERIFIED);
    }

    @Test
    @DisplayName("VERIFIED라도 CI가 없으면(카카오 인증서 등) CI_UNAVAILABLE 예외를 던진다")
    void verify_ciUnavailable() {
        IdentityVerificationResult withoutCi = new IdentityVerificationResult(
            "VERIFIED", "홍길동", "1998-01-02", "01012345678", "MALE", null);

        assertThatThrownBy(() -> serviceWith(withoutCi).verify("identity-verification-1"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.IDENTITY_VERIFICATION_CI_UNAVAILABLE);
    }

}
