package com.allme.back.user.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;

public record IdentityVerificationVerifyRequest(
    @NotBlank(message = "본인인증 ID는 필수입니다.")
    String identityVerificationId
) {}
