package com.allme.back.proposal.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ProposalSubmitRequest(

    /** 제안 금액(원) */
    @NotNull(message = "제안 금액을 입력해주세요.")
    @Positive(message = "제안 금액은 0보다 커야 합니다.")
    Long amount,

    @NotBlank(message = "제안 내용을 입력해주세요.")
    @Size(max = 2000, message = "제안 내용은 2,000자 이하로 입력해주세요.")
    String message

) { }
