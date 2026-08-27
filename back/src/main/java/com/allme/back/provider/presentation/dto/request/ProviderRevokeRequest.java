package com.allme.back.provider.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProviderRevokeRequest(

    @NotBlank(message = "해제 사유를 입력해주세요.")
    @Size(max = 500, message = "해제 사유는 500자 이하로 입력해주세요.")
    String reason

) { }
