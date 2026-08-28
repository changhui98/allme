package com.allme.back.proposal.presentation.dto.response;

import com.allme.back.proposal.domain.entity.Proposal;
import java.time.LocalDateTime;

/** 요청 작성자가 보는 받은 제안 행 — providerName은 업체명(최신 승인 신청서), 없으면 닉네임. providerNickname은 항상 닉네임. */
public record ReceivedProposalResponse(
    Long id,
    Long providerUserId,
    String providerName,
    String providerNickname,
    long amount,
    String message,
    String status,
    LocalDateTime createdDate,
    LocalDateTime decidedDate
) {

    public static ReceivedProposalResponse from(
        Proposal proposal, String providerName, String providerNickname
    ) {
        return new ReceivedProposalResponse(
            proposal.getId(),
            proposal.getProviderUserId(),
            providerName,
            providerNickname,
            proposal.getAmount(),
            proposal.getMessage(),
            proposal.getStatus().name(),
            proposal.getCreatedDate(),
            proposal.getDecidedDate()
        );
    }

}
