package com.allme.back.request.presentation.dto.response;

import com.allme.back.request.domain.entity.ServiceRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** 내 요청 목록 행 — 상세 주소·본문은 내리지 않는다. */
public record MyServiceRequestSummaryResponse(
    Long id,
    String category,
    String title,
    String region,
    LocalDate preferredDate,
    boolean scheduleNegotiable,
    Long budgetMin,
    Long budgetMax,
    boolean budgetNegotiable,
    String status,
    long proposalCount,
    LocalDateTime createdDate
) {

    public static MyServiceRequestSummaryResponse from(ServiceRequest request) {
        return new MyServiceRequestSummaryResponse(
            request.getId(),
            request.getCategory().name(),
            request.getTitle(),
            request.getRegion().name(),
            request.getPreferredDate(),
            request.isScheduleNegotiable(),
            request.getBudgetMin(),
            request.getBudgetMax(),
            request.isBudgetNegotiable(),
            request.getStatus().name(),
            request.getProposalCount(),
            request.getCreatedDate()
        );
    }

}
