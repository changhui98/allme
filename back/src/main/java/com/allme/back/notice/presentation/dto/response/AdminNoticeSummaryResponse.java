package com.allme.back.notice.presentation.dto.response;

import com.allme.back.notice.domain.entity.Notice;
import java.time.LocalDateTime;

/** 관리자 목록 행 — 작성자는 loginId로만 식별(개인정보 최소화). */
public record AdminNoticeSummaryResponse(
    Long id,
    String title,
    boolean published,
    boolean pinned,
    long viewCount,
    String authorLoginId,
    LocalDateTime createdDate
) {

    public static AdminNoticeSummaryResponse from(Notice notice, String authorLoginId) {
        return new AdminNoticeSummaryResponse(
            notice.getId(),
            notice.getTitle(),
            notice.isPublished(),
            notice.isPinned(),
            notice.getViewCount(),
            authorLoginId,
            notice.getCreatedDate()
        );
    }

}
