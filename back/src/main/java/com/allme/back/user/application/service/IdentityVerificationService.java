package com.allme.back.user.application.service;

import com.allme.back.global.exception.AppException;
import com.allme.back.user.application.port.IdentityVerificationPort;
import com.allme.back.user.application.port.IdentityVerificationPort.IdentityVerificationResult;
import com.allme.back.user.domain.UserErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IdentityVerificationService {

    private final IdentityVerificationPort identityVerificationPort;

    /**
     * 본인인증 건이 VERIFIED 상태인지 포트원에 조회해 확인하고 인증 정보를 반환한다.
     * CI 미제공 인증 수단(예: 카카오 인증서)은 중복가입 체크가 불가능하므로 거부한다.
     */
    public IdentityVerificationResult verify(String identityVerificationId) {

        IdentityVerificationResult result = identityVerificationPort.get(identityVerificationId);

        if (!result.isVerified()) {
            throw new AppException(UserErrorCode.IDENTITY_VERIFICATION_NOT_VERIFIED);
        }

        if (result.ci() == null || result.ci().isBlank()) {
            throw new AppException(UserErrorCode.IDENTITY_VERIFICATION_CI_UNAVAILABLE);
        }

        return result;
    }

}
