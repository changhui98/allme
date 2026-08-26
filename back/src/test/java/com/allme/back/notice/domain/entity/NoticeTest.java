package com.allme.back.notice.domain.entity;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class NoticeTest {

    @Test
    @DisplayName("수정하면 제목·본문·공개·고정 값이 모두 바뀐다")
    void update_replacesAllFields() {
        Notice notice = Notice.create(1L, "제목", "본문", false, false);

        notice.update("새 제목", "새 본문", true, true);

        assertThat(notice.getTitle()).isEqualTo("새 제목");
        assertThat(notice.getContent()).isEqualTo("새 본문");
        assertThat(notice.isPublished()).isTrue();
        assertThat(notice.isPinned()).isTrue();
        assertThat(notice.getAuthorUserId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("삭제는 소프트 삭제 — deletedDate만 찍히고 데이터는 남는다")
    void delete_isSoft() {
        Notice notice = Notice.create(1L, "제목", "본문", true, false);

        notice.delete();

        assertThat(notice.isDeleted()).isTrue();
        assertThat(notice.getTitle()).isEqualTo("제목");
    }

}
