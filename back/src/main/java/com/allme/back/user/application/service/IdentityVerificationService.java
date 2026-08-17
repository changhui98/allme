package com.allme.back.user.application.service;

import com.allme.back.global.crypto.HmacSha256Hasher;
import com.allme.back.global.exception.AppException;
import com.allme.back.user.application.port.IdentityVerificationPort;
import com.allme.back.user.application.port.IdentityVerificationPort.IdentityVerificationResult;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IdentityVerificationService {

    private final IdentityVerificationPort identityVerificationPort;
    private final UserRepository userRepository;
    private final HmacSha256Hasher hmacSha256Hasher;

    /**
     * 본인인증 건이 VERIFIED 상태인지 포트원에 조회해 확인하고 인증 정보를 반환한다.
     * CI 미제공 인증 수단(예: 카카오 인증서)은 중복가입 체크가 불가능하므로 거부한다.
     * 같은 CI로 이미 가입된 계정이 있으면 U009 — 인증 스텝(2단계)에서 바로 알려
     * 정보 입력(3단계)까지 진행한 뒤에야 중복을 알게 되는 상황을 막는다.
     * (가입 API도 이 메서드를 거치므로 두 경로 모두 동일하게 차단된다.)
     */
    public IdentityVerificationResult verify(String identityVerificationId) {

        IdentityVerificationResult result = identityVerificationPort.get(identityVerificationId);

        if (!result.isVerified()) {
            throw new AppException(UserErrorCode.IDENTITY_VERIFICATION_NOT_VERIFIED);
        }

        if (result.ci() == null || result.ci().isBlank()) {
            throw new AppException(UserErrorCode.IDENTITY_VERIFICATION_CI_UNAVAILABLE);
        }

        if (userRepository.existsByCiHash(hmacSha256Hasher.hash(result.ci()))) {
            throw new AppException(UserErrorCode.ALREADY_REGISTERED);
        }

        return result;
    }

}
