package com.allme.back.notice.domain.entity;

import com.allme.back.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 공지사항 — 매니저/관리자가 등록하고 공개(published)된 것만 클라이언트에 노출된다.
 * - 상단 고정(pinned) 공지는 공개 목록에서 최신순보다 앞에 온다.
 * - 삭제는 BaseEntity 소프트 삭제(deletedDate) — 모든 조회 쿼리가 deletedDate is null 조건을 건다.
 * - 작성자는 user 도메인 관례대로 JPA 연관 없이 userId(Long)로만 참조한다(DB FK 없음).
 * - 본문은 길이 제한 없는 text 컬럼(@Lob은 PostgreSQL에서 oid로 매핑되므로 쓰지 않는다).
 * - 조회수(viewCount)는 NoticeJpaRepository.incrementViewCount의 원자 UPDATE로만 올린다(엔티티 메서드 없음).
 *   기존 행이 있는 테이블에 not null 컬럼을 ddl-auto: update로 붙이려면 DB 기본값이 필요해 columnDefinition을 명시.
 */
@Entity
@Table(
    name = "notices",
    indexes = {
        @Index(name = "idx_notices_published_pinned_id", columnList = "published, pinned, id")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notice extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @Column(nullable = false)
    private boolean published;

    @Column(nullable = false)
    private boolean pinned;

    /** 등록한 매니저·관리자 user id */
    @Column(name = "author_user_id", nullable = false)
    private Long authorUserId;

    /** 공개 상세 열람 수 — 24시간 중복 방지(NoticeViewDedupPort) 후 집계 */
    @Column(name = "view_count", nullable = false, columnDefinition = "bigint not null default 0")
    private long viewCount;

    private Notice(Long authorUserId, String title, String content, boolean published, boolean pinned) {
        this.authorUserId = authorUserId;
        this.title = title;
        this.content = content;
        this.published = published;
        this.pinned = pinned;
        this.viewCount = 0;
    }

    public static Notice create(
        Long authorUserId, String title, String content, boolean published, boolean pinned
    ) {
        return new Notice(authorUserId, title, content, published, pinned);
    }

    public void update(String title, String content, boolean published, boolean pinned) {
        this.title = title;
        this.content = content;
        this.published = published;
        this.pinned = pinned;
    }

}
