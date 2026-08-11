package com.allme.back.user.presentation.dto.response;

import com.allme.back.user.application.port.IdentityVerificationPort.IdentityVerificationResult;

/**
 * 본인인증 검증 응답. 개인정보 최소화 원칙으로 ci는 내리지 않는다
 * (가입 완료 API가 identityVerificationId로 서버에서 재조회).
 */
public record IdentityVerificationResponse(
    String name,
    String birthDate,
    String phoneNumber,
    String gender
) {

    public static IdentityVerificationResponse from(IdentityVerificationResult result) {
        return new IdentityVerificationResponse(
            result.name(),
            result.birthDate(),
            result.phoneNumber(),
            result.gender()
        );
    }

}
