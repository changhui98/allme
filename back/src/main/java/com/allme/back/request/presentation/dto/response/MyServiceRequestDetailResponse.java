package com.allme.back.request.presentation.dto.response;

import com.allme.back.request.application.service.ServiceRequestService;
import com.allme.back.request.domain.entity.ServiceRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** 내 요청 상세 — 본인에게만 내리므로 상세 주소를 포함한다. unitType은 카테고리가 정한 단위. */
public record MyServiceRequestDetailResponse(
    Long id,
    String category,
    String title,
    String content,
    String region,
    String addressDetail,
    LocalDate preferredDate,
    boolean scheduleNegotiable,
    Long budgetMin,
    Long budgetMax,
    boolean budgetNegotiable,
    String unitType,
    Integer unitValue,
    String status,
    long proposalCount,
    Long acceptedProposalId,
    LocalDateTime createdDate,
    List<AttachmentResponse> attachments
) {

    public record AttachmentResponse(Long fileId, String url) {

        public static AttachmentResponse from(ServiceRequestService.Attachment attachment) {
            return new AttachmentResponse(attachment.fileId(), attachment.url());
        }

    }

    public static MyServiceRequestDetailResponse from(
        ServiceRequest request, List<ServiceRequestService.Attachment> attachments
    ) {
        return new MyServiceRequestDetailResponse(
            request.getId(),
            request.getCategory().name(),
            request.getTitle(),
            request.getContent(),
            request.getRegion().name(),
            request.getAddressDetail(),
            request.getPreferredDate(),
            request.isScheduleNegotiable(),
            request.getBudgetMin(),
            request.getBudgetMax(),
            request.isBudgetNegotiable(),
            request.getCategory().getUnitType().name(),
            request.getUnitValue(),
            request.getStatus().name(),
            request.getProposalCount(),
            request.getAcceptedProposalId(),
            request.getCreatedDate(),
            attachments.stream().map(AttachmentResponse::from).toList()
        );
    }

}
