package com.allme.back.faq.presentation.dto.response;

import com.allme.back.faq.domain.entity.Faq;

/** 공개 FAQ 항목 */
public record FaqResponse(
    Long id,
    String category,
    String question,
    String answer,
    int displayOrder
) {

    public static FaqResponse from(Faq faq) {
        return new FaqResponse(
            faq.getId(), faq.getCategory().name(), faq.getQuestion(), faq.getAnswer(), faq.getDisplayOrder());
    }

}
