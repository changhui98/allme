package com.allme.back.inquiry.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record InquiryAnswerRequest(

    @NotBlank(message = "답변을 입력해주세요.")
    @Size(max = 10000, message = "답변은 10,000자 이하로 입력해주세요.")
    String answer

) { }
