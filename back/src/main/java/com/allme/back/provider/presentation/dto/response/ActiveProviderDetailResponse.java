package com.allme.back.provider.presentation.dto.response;

import com.allme.back.provider.domain.entity.ProviderApplication;
import java.time.LocalDateTime;

/** 활동 업체 상세 — application은 최신 승인 신청서(수동 역할 부여 회원은 null). */
public record ActiveProviderDetailResponse(
    Long userId,
    String loginId,
    ApprovedApplication application
) {

    public record ApprovedApplication(
        Long id,
        String businessName,
        String businessRegistrationNumber,
        String introduction,
        String contactPhone,
        LocalDateTime createdDate,
        LocalDateTime approvedDate,
        String approvedByLoginId
    ) { }

    public static ActiveProviderDetailResponse from(
        Long userId, String loginId, ProviderApplication applicationOrNull, String approvedByLoginIdOrNull
    ) {
        ApprovedApplication application = applicationOrNull == null ? null : new ApprovedApplication(
            applicationOrNull.getId(),
            applicationOrNull.getBusinessName(),
            applicationOrNull.getBusinessRegistrationNumber(),
            applicationOrNull.getIntroduction(),
            applicationOrNull.getContactPhone(),
            applicationOrNull.getCreatedDate(),
            applicationOrNull.getProcessedDate(),
            approvedByLoginIdOrNull
        );
        return new ActiveProviderDetailResponse(userId, loginId, application);
    }

}
