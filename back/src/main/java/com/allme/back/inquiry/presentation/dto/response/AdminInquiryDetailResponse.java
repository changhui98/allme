package com.allme.back.inquiry.presentation.dto.response;

import com.allme.back.inquiry.domain.entity.Inquiry;
import java.time.LocalDateTime;

/** 관리자 상세 */
public record AdminInquiryDetailResponse(
    Long id,
    String title,
    String content,
    String status,
    String authorLoginId,
    String answer,
    String answeredByLoginId,
    LocalDateTime answeredDate,
    LocalDateTime createdDate
) {

    public static AdminInquiryDetailResponse from(
        Inquiry inquiry, String authorLoginId, String answeredByLoginId
    ) {
        return new AdminInquiryDetailResponse(
            inquiry.getId(),
            inquiry.getTitle(),
            inquiry.getContent(),
            inquiry.getStatus().name(),
            authorLoginId,
            inquiry.getAnswer(),
            answeredByLoginId,
            inquiry.getAnsweredDate(),
            inquiry.getCreatedDate()
        );
    }

}
