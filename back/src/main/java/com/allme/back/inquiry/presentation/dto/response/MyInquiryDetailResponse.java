package com.allme.back.inquiry.presentation.dto.response;

import com.allme.back.inquiry.domain.entity.Inquiry;
import java.time.LocalDateTime;

/** 내 문의 상세 — 답변자는 노출하지 않는다(운영 스태프 식별 정보 비공개). */
public record MyInquiryDetailResponse(
    Long id,
    String title,
    String content,
    String status,
    String answer,
    LocalDateTime answeredDate,
    LocalDateTime createdDate
) {

    public static MyInquiryDetailResponse from(Inquiry inquiry) {
        return new MyInquiryDetailResponse(
            inquiry.getId(),
            inquiry.getTitle(),
            inquiry.getContent(),
            inquiry.getStatus().name(),
            inquiry.getAnswer(),
            inquiry.getAnsweredDate(),
            inquiry.getCreatedDate()
        );
    }

}
