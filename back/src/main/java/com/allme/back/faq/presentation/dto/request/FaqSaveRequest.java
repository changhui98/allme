package com.allme.back.faq.presentation.dto.request;

import com.allme.back.faq.domain.FaqCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** FAQ 등록·수정 공용 요청 */
public record FaqSaveRequest(

    @NotNull(message = "분류를 선택해주세요.")
    FaqCategory category,

    @NotBlank(message = "질문을 입력해주세요.")
    @Size(max = 300, message = "질문은 300자 이하로 입력해주세요.")
    String question,

    @NotBlank(message = "답변을 입력해주세요.")
    @Size(max = 10000, message = "답변은 10,000자 이하로 입력해주세요.")
    String answer,

    @Min(value = 0, message = "노출 순서는 0 이상이어야 합니다.")
    int displayOrder,

    boolean published

) { }
