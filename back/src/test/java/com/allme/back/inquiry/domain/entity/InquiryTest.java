package com.allme.back.inquiry.domain.entity;

import static org.assertj.core.api.Assertions.assertThat;

import com.allme.back.inquiry.domain.InquiryStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class InquiryTest {

    @Test
    @DisplayName("작성 직후에는 답변 대기 상태이고 답변 정보가 비어 있다")
    void create_pending() {
        Inquiry inquiry = Inquiry.create(1L, "제목", "내용");

        assertThat(inquiry.getStatus()).isEqualTo(InquiryStatus.PENDING);
        assertThat(inquiry.getAnswer()).isNull();
        assertThat(inquiry.getAnsweredByUserId()).isNull();
        assertThat(inquiry.getAnsweredDate()).isNull();
    }

    @Test
    @DisplayName("답변하면 답변 완료로 전이되고 답변자·시각이 기록된다")
    void answer_transitionsToAnswered() {
        Inquiry inquiry = Inquiry.create(1L, "제목", "내용");

        inquiry.answer(99L, "안녕하세요, 답변입니다.");

        assertThat(inquiry.getStatus()).isEqualTo(InquiryStatus.ANSWERED);
        assertThat(inquiry.getAnswer()).isEqualTo("안녕하세요, 답변입니다.");
        assertThat(inquiry.getAnsweredByUserId()).isEqualTo(99L);
        assertThat(inquiry.getAnsweredDate()).isNotNull();
    }

    @Test
    @DisplayName("답변 완료 후 다시 답변하면 내용·답변자가 덮어써지고 상태는 유지된다")
    void answer_again_overwrites() {
        Inquiry inquiry = Inquiry.create(1L, "제목", "내용");
        inquiry.answer(99L, "첫 답변");

        inquiry.answer(100L, "수정된 답변");

        assertThat(inquiry.getStatus()).isEqualTo(InquiryStatus.ANSWERED);
        assertThat(inquiry.getAnswer()).isEqualTo("수정된 답변");
        assertThat(inquiry.getAnsweredByUserId()).isEqualTo(100L);
    }

}
