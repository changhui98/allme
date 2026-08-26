package com.allme.back.faq.presentation.dto.response;

import com.allme.back.faq.domain.entity.Faq;
import java.time.LocalDateTime;

/** 관리자 상세(수정 폼 프리필용) */
public record AdminFaqDetailResponse(
    Long id,
    String category,
    String question,
    String answer,
    int displayOrder,
    boolean published,
    LocalDateTime createdDate,
    LocalDateTime lastModifiedDate
) {

    public static AdminFaqDetailResponse from(Faq faq) {
        return new AdminFaqDetailResponse(
            faq.getId(),
            faq.getCategory().name(),
            faq.getQuestion(),
            faq.getAnswer(),
            faq.getDisplayOrder(),
            faq.isPublished(),
            faq.getCreatedDate(),
            faq.getLastModifiedDate()
        );
    }

}
