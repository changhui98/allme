package com.allme.back.inquiry.presentation.dto.response;

import com.allme.back.inquiry.domain.entity.Inquiry;
import java.time.LocalDateTime;

/** 관리자 목록 행 — 작성자·답변자는 loginId로만 식별(개인정보 최소화). */
public record AdminInquirySummaryResponse(
    Long id,
    String title,
    String status,
    String authorLoginId,
    String answeredByLoginId,
    LocalDateTime createdDate,
    LocalDateTime answeredDate
) {

    public static AdminInquirySummaryResponse from(
        Inquiry inquiry, String authorLoginId, String answeredByLoginId
    ) {
        return new AdminInquirySummaryResponse(
            inquiry.getId(),
            inquiry.getTitle(),
            inquiry.getStatus().name(),
            authorLoginId,
            answeredByLoginId,
            inquiry.getCreatedDate(),
            inquiry.getAnsweredDate()
        );
    }

}
