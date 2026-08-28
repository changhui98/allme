package com.allme.back.proposal.presentation.dto.response;

import com.allme.back.proposal.domain.entity.Proposal;
import com.allme.back.request.domain.entity.ServiceRequest;
import java.time.LocalDateTime;

/** 업체가 보는 내 제안 — 요청 제목·카테고리·상태를 함께 내린다(요청이 삭제됐으면 null). */
public record MyProposalResponse(
    Long id,
    Long requestId,
    String requestTitle,
    String requestCategory,
    String requestStatus,
    long amount,
    String message,
    String status,
    LocalDateTime createdDate,
    LocalDateTime decidedDate
) {

    public static MyProposalResponse from(Proposal proposal, ServiceRequest requestOrNull) {
        return new MyProposalResponse(
            proposal.getId(),
            proposal.getRequestId(),
            requestOrNull != null ? requestOrNull.getTitle() : null,
            requestOrNull != null ? requestOrNull.getCategory().name() : null,
            requestOrNull != null ? requestOrNull.getStatus().name() : null,
            proposal.getAmount(),
            proposal.getMessage(),
            proposal.getStatus().name(),
            proposal.getCreatedDate(),
            proposal.getDecidedDate()
        );
    }

}
