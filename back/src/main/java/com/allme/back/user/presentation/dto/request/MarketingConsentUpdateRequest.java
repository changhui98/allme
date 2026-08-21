package com.allme.back.user.presentation.dto.request;

import jakarta.validation.constraints.NotNull;

public record MarketingConsentUpdateRequest(

    @NotNull(message = "동의 여부를 선택해주세요.")
    Boolean marketingConsent

) { }
