package com.allme.back.provider.presentation.dto.response;

import com.allme.back.provider.domain.entity.ProviderApplication;
import java.time.LocalDateTime;

/** 관리자 목록 행 — 신청자는 개인정보 최소화 원칙에 따라 loginId로만 식별한다. */
public record ProviderApplicationSummaryResponse(
    Long id,
    String businessName,
    String applicantLoginId,
    String status,
    LocalDateTime createdDate
) {

    public static ProviderApplicationSummaryResponse from(
        ProviderApplication application, String applicantLoginId
    ) {
        return new ProviderApplicationSummaryResponse(
            application.getId(),
            application.getBusinessName(),
            applicantLoginId,
            application.getStatus().name(),
            application.getCreatedDate()
        );
    }

}
