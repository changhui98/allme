package com.allme.back.faq.domain.entity;

import com.allme.back.faq.domain.FaqCategory;
import com.allme.back.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 자주 묻는 질문 — 매니저/관리자가 등록하고 공개(published)된 것만 클라이언트에 노출된다.
 * - 노출 순서는 displayOrder 오름차순(같으면 id 오름차순). 유니크 제약 없음 — 같은 순서 값 허용.
 * - 삭제는 BaseEntity 소프트 삭제 — 모든 조회 쿼리가 deletedDate is null 조건을 건다.
 */
@Entity
@Table(
    name = "faqs",
    indexes = {
        @Index(name = "idx_faqs_category_order", columnList = "category, display_order, id")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Faq extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FaqCategory category;

    @Column(nullable = false, length = 300)
    private String question;

    @Column(nullable = false, columnDefinition = "text")
    private String answer;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(nullable = false)
    private boolean published;

    private Faq(FaqCategory category, String question, String answer, int displayOrder, boolean published) {
        this.category = category;
        this.question = question;
        this.answer = answer;
        this.displayOrder = displayOrder;
        this.published = published;
    }

    public static Faq create(
        FaqCategory category, String question, String answer, int displayOrder, boolean published
    ) {
        return new Faq(category, question, answer, displayOrder, published);
    }

    public void update(
        FaqCategory category, String question, String answer, int displayOrder, boolean published
    ) {
        this.category = category;
        this.question = question;
        this.answer = answer;
        this.displayOrder = displayOrder;
        this.published = published;
    }

}
