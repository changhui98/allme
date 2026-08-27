package com.allme.back.notice.domain.repository;

import com.allme.back.notice.domain.entity.Notice;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/** 소프트 삭제된 행은 모든 조회에서 제외한다. */
public interface NoticeRepository {

    Notice save(Notice notice);

    Optional<Notice> findById(Long id);

    /** 공개 공지 1건 — 비공개·삭제는 없는 것으로 취급 */
    Optional<Notice> findPublishedById(Long id);

    /** 관리자 목록 — published가 null이면 전체, keyword가 null이면 검색 없음(제목·본문 부분 일치). 정렬은 pageable이 정한다. */
    Page<Notice> findAdminPage(Boolean publishedOrNull, String keywordOrNull, Pageable pageable);

    /** 공개 목록 — keyword가 null이면 검색 없음. 정렬(고정 우선 + 최신/조회순)은 pageable이 정한다. */
    Page<Notice> findPublishedPage(String keywordOrNull, Pageable pageable);

    /** 상세의 이전 글 — 공개 공지 시간순(id 작은 쪽), 고정·정렬 옵션 무관 */
    Optional<Notice> findPreviousPublished(Long id);

    /** 상세의 다음 글 — 공개 공지 시간순(id 큰 쪽) */
    Optional<Notice> findNextPublished(Long id);

    /** 조회수 +1 (원자 UPDATE). 호출 후 같은 트랜잭션에서 findById 하면 증가된 값을 읽는다. */
    void incrementViewCount(Long id);

}
