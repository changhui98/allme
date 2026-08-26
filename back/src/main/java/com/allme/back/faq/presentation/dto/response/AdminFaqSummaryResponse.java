package com.allme.back.faq.presentation.dto.response;

import com.allme.back.faq.domain.entity.Faq;
import java.time.LocalDateTime;

/** 관리자 목록 행 */
public record AdminFaqSummaryResponse(
    Long id,
    String category,
    String question,
    int displayOrder,
    boolean published,
    LocalDateTime createdDate
) {

    public static AdminFaqSummaryResponse from(Faq faq) {
        return new AdminFaqSummaryResponse(
            faq.getId(),
            faq.getCategory().name(),
            faq.getQuestion(),
            faq.getDisplayOrder(),
            faq.isPublished(),
            faq.getCreatedDate()
        );
    }

}
