package com.allme.back.notice.presentation.dto.response;

import com.allme.back.notice.domain.entity.Notice;
import java.time.LocalDateTime;

/** 공개 상세 */
public record NoticeDetailResponse(
    Long id,
    String title,
    String content,
    boolean pinned,
    long viewCount,
    LocalDateTime createdDate,
    LocalDateTime lastModifiedDate
) {

    public static NoticeDetailResponse from(Notice notice) {
        return new NoticeDetailResponse(
            notice.getId(),
            notice.getTitle(),
            notice.getContent(),
            notice.isPinned(),
            notice.getViewCount(),
            notice.getCreatedDate(),
            notice.getLastModifiedDate()
        );
    }

}
