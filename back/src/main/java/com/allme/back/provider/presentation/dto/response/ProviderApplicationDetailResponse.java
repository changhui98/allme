package com.allme.back.provider.presentation.dto.response;

import com.allme.back.provider.domain.entity.ProviderApplication;
import java.time.LocalDateTime;

/** 관리자 상세 — 신청자 실명은 노출하지 않는다(개인정보 최소화, loginId로 식별). */
public record ProviderApplicationDetailResponse(
    Long id,
    String businessName,
    String businessRegistrationNumber,
    String introduction,
    String contactPhone,
    String applicantLoginId,
    String status,
    String rejectReason,
    String processedByLoginId,
    LocalDateTime createdDate,
    LocalDateTime processedDate
) {

    public static ProviderApplicationDetailResponse from(
        ProviderApplication application, String applicantLoginId, String processedByLoginId
    ) {
        return new ProviderApplicationDetailResponse(
            application.getId(),
            application.getBusinessName(),
            application.getBusinessRegistrationNumber(),
            application.getIntroduction(),
            application.getContactPhone(),
            applicantLoginId,
            application.getStatus().name(),
            application.getRejectReason(),
            processedByLoginId,
            application.getCreatedDate(),
            application.getProcessedDate()
        );
    }

}
