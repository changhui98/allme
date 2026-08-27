package com.allme.back.notice.infrastructure.repository;

import com.allme.back.notice.domain.entity.Notice;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NoticeJpaRepository extends JpaRepository<Notice, Long> {

    Optional<Notice> findByIdAndDeletedDateIsNull(Long id);

    Optional<Notice> findByIdAndPublishedTrueAndDeletedDateIsNull(Long id);

    Page<Notice> findByDeletedDateIsNull(Pageable pageable);

    Page<Notice> findByPublishedAndDeletedDateIsNull(boolean published, Pageable pageable);

    /** 이전 글 — 공개 공지 중 id가 더 작은 것(먼저 올라온 글) */
    Optional<Notice> findFirstByPublishedTrueAndDeletedDateIsNullAndIdLessThanOrderByIdDesc(Long id);

    /** 다음 글 — 공개 공지 중 id가 더 큰 것(나중에 올라온 글) */
    Optional<Notice> findFirstByPublishedTrueAndDeletedDateIsNullAndIdGreaterThanOrderByIdAsc(Long id);

    /*
     * 키워드 검색 — 제목·본문 부분 일치(대소문자 무시).
     * LIKE에 null을 바인딩하면 PostgreSQL이 bytea로 추론해 실패하므로(회원 검색 이력),
     * 키워드 유무·published 유무를 호출부(RepositoryImpl)에서 분기해 메서드를 나눈다.
     */
    @Query(
        value = """
            select n from Notice n
            where n.published = true and n.deletedDate is null
              and (lower(n.title) like lower(concat('%', :keyword, '%'))
                or lower(n.content) like lower(concat('%', :keyword, '%')))
            """,
        countQuery = """
            select count(n) from Notice n
            where n.published = true and n.deletedDate is null
              and (lower(n.title) like lower(concat('%', :keyword, '%'))
                or lower(n.content) like lower(concat('%', :keyword, '%')))
            """
    )
    Page<Notice> searchPublished(@Param("keyword") String keyword, Pageable pageable);

    @Query(
        value = """
            select n from Notice n
            where n.deletedDate is null
              and (lower(n.title) like lower(concat('%', :keyword, '%'))
                or lower(n.content) like lower(concat('%', :keyword, '%')))
            """,
        countQuery = """
            select count(n) from Notice n
            where n.deletedDate is null
              and (lower(n.title) like lower(concat('%', :keyword, '%'))
                or lower(n.content) like lower(concat('%', :keyword, '%')))
            """
    )
    Page<Notice> searchAdmin(@Param("keyword") String keyword, Pageable pageable);

    @Query(
        value = """
            select n from Notice n
            where n.published = :published and n.deletedDate is null
              and (lower(n.title) like lower(concat('%', :keyword, '%'))
                or lower(n.content) like lower(concat('%', :keyword, '%')))
            """,
        countQuery = """
            select count(n) from Notice n
            where n.published = :published and n.deletedDate is null
              and (lower(n.title) like lower(concat('%', :keyword, '%'))
                or lower(n.content) like lower(concat('%', :keyword, '%')))
            """
    )
    Page<Notice> searchAdminByPublished(
        @Param("published") boolean published, @Param("keyword") String keyword, Pageable pageable
    );

    /**
     * 조회수 원자 증가 — 동시 열람에도 유실 없음. clearAutomatically로 1차 캐시를 비워
     * 직후 재조회가 증가된 DB 값을 읽게 한다(벌크 UPDATE는 관리 엔티티를 갱신하지 않으므로).
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Notice n set n.viewCount = n.viewCount + 1 where n.id = :id")
    int incrementViewCount(@Param("id") Long id);

}
