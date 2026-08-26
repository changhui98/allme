package com.allme.back.inquiry.domain.entity;

import com.allme.back.global.entity.BaseEntity;
import com.allme.back.inquiry.domain.InquiryStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 1:1 문의 — 회원(USER)이 작성하고 매니저/관리자가 답변한다.
 * - 작성자·답변자는 user 도메인 관례대로 JPA 연관 없이 userId(Long)로만 참조한다(DB FK 없음).
 * - 답변은 별도 테이블 없이 같은 행의 answer 컬럼 — 문의 1건당 답변 1개(수정은 덮어쓰기)라 충분하다.
 * - 상태 전이는 PENDING → ANSWERED 한 방향이며, 답변 완료 후 재답변(수정)은 상태를 유지한 채 내용만 갱신한다.
 */
@Entity
@Table(
    name = "inquiries",
    indexes = {
        @Index(name = "idx_inquiries_status_id", columnList = "status, id"),
        @Index(name = "idx_inquiries_user_id_id", columnList = "user_id, id")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Inquiry extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InquiryStatus status;

    @Column(columnDefinition = "text")
    private String answer;

    /** 답변한 매니저·관리자 user id */
    @Column(name = "answered_by_user_id")
    private Long answeredByUserId;

    /** 최근 답변(등록·수정) 시각 */
    @Column(name = "answered_date")
    private LocalDateTime answeredDate;

    private Inquiry(Long userId, String title, String content) {
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.status = InquiryStatus.PENDING;
    }

    public static Inquiry create(Long userId, String title, String content) {
        return new Inquiry(userId, title, content);
    }

    /** 답변 등록·수정 — 상태를 ANSWERED로 바꾸고 답변자·시각을 갱신한다. */
    public void answer(Long adminUserId, String answer) {
        this.status = InquiryStatus.ANSWERED;
        this.answer = answer;
        this.answeredByUserId = adminUserId;
        this.answeredDate = LocalDateTime.now(KST_CLOCK);
    }

}
