package com.allme.back.provider.presentation.dto.response;

import com.allme.back.provider.domain.entity.ProviderApplication;
import java.time.LocalDateTime;

/**
 * 관리자 목록 행 — 신청자·처리자는 개인정보 최소화 원칙에 따라 loginId로만 식별한다.
 * processedByLoginId·processedDate는 승인/반려된 행에만 있고 대기 중이면 null.
 */
public record ProviderApplicationSummaryResponse(
    Long id,
    String businessName,
    String applicantLoginId,
    String status,
    String processedByLoginId,
    LocalDateTime createdDate,
    LocalDateTime processedDate
) {

    public static ProviderApplicationSummaryResponse from(
        ProviderApplication application, String applicantLoginId, String processedByLoginId
    ) {
        return new ProviderApplicationSummaryResponse(
            application.getId(),
            application.getBusinessName(),
            applicantLoginId,
            application.getStatus().name(),
            processedByLoginId,
            application.getCreatedDate(),
            application.getProcessedDate()
        );
    }

}
