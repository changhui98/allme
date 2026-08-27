package com.allme.back.provider.presentation.dto.response;

import com.allme.back.provider.domain.entity.ProviderApplication;
import java.time.LocalDateTime;

/**
 * 활동 업체 목록 행 — 회원은 loginId로만 식별(개인정보 최소화).
 * 업체명·사업자번호·승인일·승인자는 최신 승인 신청서에서 오며, 수동 역할 부여 회원은 전부 null.
 */
public record ActiveProviderSummaryResponse(
    Long userId,
    String loginId,
    String businessName,
    String businessRegistrationNumber,
    LocalDateTime approvedDate,
    String approvedByLoginId
) {

    public static ActiveProviderSummaryResponse from(
        Long userId, String loginId, ProviderApplication applicationOrNull, String approvedByLoginIdOrNull
    ) {
        return new ActiveProviderSummaryResponse(
            userId,
            loginId,
            applicationOrNull != null ? applicationOrNull.getBusinessName() : null,
            applicationOrNull != null ? applicationOrNull.getBusinessRegistrationNumber() : null,
            applicationOrNull != null ? applicationOrNull.getProcessedDate() : null,
            approvedByLoginIdOrNull
        );
    }

}
