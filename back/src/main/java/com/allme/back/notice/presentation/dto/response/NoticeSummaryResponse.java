package com.allme.back.notice.presentation.dto.response;

import com.allme.back.notice.domain.entity.Notice;
import java.time.LocalDateTime;

/** 공개 목록 행 */
public record NoticeSummaryResponse(
    Long id,
    String title,
    boolean pinned,
    long viewCount,
    LocalDateTime createdDate
) {

    public static NoticeSummaryResponse from(Notice notice) {
        return new NoticeSummaryResponse(
            notice.getId(), notice.getTitle(), notice.isPinned(), notice.getViewCount(), notice.getCreatedDate());
    }

}
