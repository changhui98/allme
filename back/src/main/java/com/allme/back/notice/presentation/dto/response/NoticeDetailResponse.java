package com.allme.back.notice.presentation.dto.response;

import com.allme.back.notice.domain.entity.Notice;
import java.time.LocalDateTime;

/** 공개 상세 — previous/next는 공개 공지 시간순 이웃(없으면 null), 하단 이전·다음 글 내비용 */
public record NoticeDetailResponse(
    Long id,
    String title,
    String content,
    boolean pinned,
    long viewCount,
    LocalDateTime createdDate,
    LocalDateTime lastModifiedDate,
    NoticeLink previous,
    NoticeLink next
) {

    /** 이웃 글 링크 — id·제목만 */
    public record NoticeLink(Long id, String title) {

        static NoticeLink of(Notice notice) {
            return notice != null ? new NoticeLink(notice.getId(), notice.getTitle()) : null;
        }

    }

    public static NoticeDetailResponse from(Notice notice, Notice previousOrNull, Notice nextOrNull) {
        return new NoticeDetailResponse(
            notice.getId(),
            notice.getTitle(),
            notice.getContent(),
            notice.isPinned(),
            notice.getViewCount(),
            notice.getCreatedDate(),
            notice.getLastModifiedDate(),
            NoticeLink.of(previousOrNull),
            NoticeLink.of(nextOrNull)
        );
    }

}
