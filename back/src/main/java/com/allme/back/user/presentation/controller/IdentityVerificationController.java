package com.allme.back.user.presentation.controller;

import com.allme.back.user.application.service.IdentityVerificationService;
import com.allme.back.user.presentation.dto.request.IdentityVerificationVerifyRequest;
import com.allme.back.user.presentation.dto.response.IdentityVerificationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/identity-verifications")
@RequiredArgsConstructor
public class IdentityVerificationController {

    private final IdentityVerificationService identityVerificationService;

    /**
     * 프론트 SDK 인증 완료 후 서버 측 검증.
     * POST인 이유: 검증이라는 액션이고, 인증 건 ID를 URL·액세스 로그에 남기지 않기 위함.
     */
    @PostMapping("/verify")
    public IdentityVerificationResponse verify(
        @Valid @RequestBody IdentityVerificationVerifyRequest request
    ) {
        return IdentityVerificationResponse.from(
            identityVerificationService.verify(request.identityVerificationId())
        );
    }

}
