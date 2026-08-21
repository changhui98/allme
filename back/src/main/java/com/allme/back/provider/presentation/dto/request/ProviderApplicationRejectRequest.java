package com.allme.back.provider.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProviderApplicationRejectRequest(

    @NotBlank(message = "반려 사유를 입력해주세요.")
    @Size(max = 500, message = "반려 사유는 500자 이하로 입력해주세요.")
    String reason

) { }
