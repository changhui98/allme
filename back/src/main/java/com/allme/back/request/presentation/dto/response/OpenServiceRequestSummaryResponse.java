package com.allme.back.request.presentation.dto.response;

import com.allme.back.request.domain.entity.ServiceRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** 공개 목록 행 — 상세 주소·본문은 내리지 않는다. 작성자는 닉네임으로만(loginId·실명 비공개). */
public record OpenServiceRequestSummaryResponse(
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
    String authorNickname,
    long proposalCount,
    LocalDateTime createdDate
) {

    public static OpenServiceRequestSummaryResponse from(ServiceRequest request, String authorNickname) {
        return new OpenServiceRequestSummaryResponse(
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
            authorNickname,
            request.getProposalCount(),
            request.getCreatedDate()
        );
    }

}
