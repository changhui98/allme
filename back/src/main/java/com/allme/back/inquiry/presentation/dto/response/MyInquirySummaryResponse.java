package com.allme.back.inquiry.presentation.dto.response;

import com.allme.back.inquiry.domain.entity.Inquiry;
import java.time.LocalDateTime;

/** 내 문의 목록 행 */
public record MyInquirySummaryResponse(
    Long id,
    String title,
    String status,
    LocalDateTime createdDate
) {

    public static MyInquirySummaryResponse from(Inquiry inquiry) {
        return new MyInquirySummaryResponse(
            inquiry.getId(), inquiry.getTitle(), inquiry.getStatus().name(), inquiry.getCreatedDate());
    }

}
