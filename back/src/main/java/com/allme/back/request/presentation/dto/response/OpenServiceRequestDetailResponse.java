package com.allme.back.request.presentation.dto.response;

import com.allme.back.request.application.service.ServiceRequestService;
import com.allme.back.request.domain.entity.ServiceRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 공개 상세 — 업체가 제안 전에 보는 화면. 상세 주소는 내리지 않는다(매칭 후 별도).
 * mine: 조회자가 작성자 본인인지(비로그인은 false) — 프론트가 "내 요청" 안내로 분기한다.
 */
public record OpenServiceRequestDetailResponse(
    Long id,
    String category,
    String title,
    String content,
    String region,
    LocalDate preferredDate,
    boolean scheduleNegotiable,
    Long budgetMin,
    Long budgetMax,
    boolean budgetNegotiable,
    String unitType,
    Integer unitValue,
    String status,
    String authorNickname,
    long proposalCount,
    boolean mine,
    LocalDateTime createdDate,
    List<MyServiceRequestDetailResponse.AttachmentResponse> attachments
) {

    public static OpenServiceRequestDetailResponse from(
        ServiceRequest request, String authorNickname, boolean mine,
        List<ServiceRequestService.Attachment> attachments
    ) {
        return new OpenServiceRequestDetailResponse(
            request.getId(),
            request.getCategory().name(),
            request.getTitle(),
            request.getContent(),
            request.getRegion().name(),
            request.getPreferredDate(),
            request.isScheduleNegotiable(),
            request.getBudgetMin(),
            request.getBudgetMax(),
            request.isBudgetNegotiable(),
            request.getCategory().getUnitType().name(),
            request.getUnitValue(),
            request.getStatus().name(),
            authorNickname,
            request.getProposalCount(),
            mine,
            request.getCreatedDate(),
            attachments.stream().map(MyServiceRequestDetailResponse.AttachmentResponse::from).toList()
        );
    }

}
