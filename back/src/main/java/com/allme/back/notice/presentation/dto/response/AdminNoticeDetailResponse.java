package com.allme.back.notice.presentation.dto.response;

import com.allme.back.notice.domain.entity.Notice;
import java.time.LocalDateTime;

/** 관리자 상세(수정 폼 프리필용) */
public record AdminNoticeDetailResponse(
    Long id,
    String title,
    String content,
    boolean published,
    boolean pinned,
    long viewCount,
    String authorLoginId,
    LocalDateTime createdDate,
    LocalDateTime lastModifiedDate
) {

    public static AdminNoticeDetailResponse from(Notice notice, String authorLoginId) {
        return new AdminNoticeDetailResponse(
            notice.getId(),
            notice.getTitle(),
            notice.getContent(),
            notice.isPublished(),
            notice.isPinned(),
            notice.getViewCount(),
            authorLoginId,
            notice.getCreatedDate(),
            notice.getLastModifiedDate()
        );
    }

}
