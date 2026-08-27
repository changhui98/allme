package com.allme.back.notice.application.service;

import com.allme.back.global.exception.AppException;
import com.allme.back.notice.application.port.NoticeViewDedupPort;
import com.allme.back.notice.domain.NoticeErrorCode;
import com.allme.back.notice.domain.NoticeSort;
import com.allme.back.notice.domain.entity.Notice;
import com.allme.back.notice.domain.repository.NoticeRepository;
import com.allme.back.user.domain.repository.UserAdminQueryRepository;
import java.util.Collection;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 공지사항 유스케이스 — 관리자 CRUD와 공개 조회. */
@Service
@RequiredArgsConstructor
public class NoticeService {

    /** 목록 페이지 크기 상한 — 과대 요청 방지 */
    private static final int MAX_PAGE_SIZE = 50;

    /** 검색어 길이 상한 — 과대 LIKE 패턴 방지 */
    private static final int MAX_KEYWORD_LENGTH = 100;

    private final NoticeRepository noticeRepository;
    private final UserAdminQueryRepository userAdminQueryRepository;
    private final NoticeViewDedupPort viewDedup;

    @Transactional
    public Notice create(Long authorUserId, String title, String content, boolean published, boolean pinned) {
        return noticeRepository.save(Notice.create(authorUserId, title, content, published, pinned));
    }

    @Transactional
    public void update(Long id, String title, String content, boolean published, boolean pinned) {
        getById(id).update(title, content, published, pinned);
    }

    /** 소프트 삭제 — 행은 남기되 모든 조회에서 제외된다. */
    @Transactional
    public void delete(Long id) {
        getById(id).delete();
    }

    /** 관리자 조회 — 비공개도 포함, 삭제는 제외(N001). */
    public Notice getById(Long id) {
        return noticeRepository.findById(id)
            .orElseThrow(() -> new AppException(NoticeErrorCode.NOTICE_NOT_FOUND));
    }

    /** 관리자 목록 — published가 null이면 전체, keyword는 제목·본문 부분 일치(공백이면 무시), 고정 우선 + sort. */
    public Page<Notice> getAdminPage(
        Boolean publishedOrNull, String keyword, NoticeSort sort, int page, int size
    ) {
        return noticeRepository.findAdminPage(
            publishedOrNull, normalizeKeyword(keyword), pageable(page, size, sortOf(sort)));
    }

    /** 공개 조회 — 비공개·삭제는 없는 것으로(N001). */
    public Notice getPublished(Long id) {
        return noticeRepository.findPublishedById(id)
            .orElseThrow(() -> new AppException(NoticeErrorCode.NOTICE_NOT_FOUND));
    }

    /** 공개 목록 — 상단 고정 우선, 그 안에서 sort(최신순/조회순). keyword는 제목·본문 부분 일치(공백이면 무시). */
    public Page<Notice> getPublishedPage(String keyword, NoticeSort sort, int page, int size) {
        return noticeRepository.findPublishedPage(normalizeKeyword(keyword), pageable(page, size, sortOf(sort)));
    }

    /**
     * 공개 상세 열람 — 24시간 창 안 첫 열람(viewerKey 기준)일 때만 조회수를 올리고, 증가된 값을 담아 돌려준다.
     * 비공개·삭제·부재는 집계 없이 N001. 관리자 상세(getById)는 집계하지 않는다.
     */
    @Transactional
    public Notice viewPublished(Long id, String viewerKey) {
        Notice notice = getPublished(id);
        if (viewDedup.markViewed(id, viewerKey)) {
            noticeRepository.incrementViewCount(id);
            return getPublished(id); // clearAutomatically 이후 재조회 — DB의 증가된 값
        }
        return notice;
    }

    /** 상세의 이전·다음 글 — 공개 공지 시간순, 없으면 null. 고정·정렬 옵션과 무관(섞으면 순환·중복). */
    public record Neighbors(Notice previous, Notice next) { }

    public Neighbors neighborsOf(Long id) {
        return new Neighbors(
            noticeRepository.findPreviousPublished(id).orElse(null),
            noticeRepository.findNextPublished(id).orElse(null));
    }

    /** 고정 공지가 항상 먼저, 그 안에서 최신순(id desc) 또는 조회순(viewCount desc, id desc). */
    static Sort sortOf(NoticeSort sort) {
        Sort pinnedFirst = Sort.by(Sort.Direction.DESC, "pinned");
        Sort latest = Sort.by(Sort.Direction.DESC, "id");
        return sort == NoticeSort.VIEWS
            ? pinnedFirst.and(Sort.by(Sort.Direction.DESC, "viewCount")).and(latest)
            : pinnedFirst.and(latest);
    }

    /** 검색어 정규화 — 앞뒤 공백 제거, 비면 null(검색 없음), 상한 길이로 자른다. */
    static String normalizeKeyword(String keyword) {
        if (keyword == null) {
            return null;
        }
        String trimmed = keyword.strip();
        if (trimmed.isEmpty()) {
            return null;
        }
        return trimmed.length() > MAX_KEYWORD_LENGTH ? trimmed.substring(0, MAX_KEYWORD_LENGTH) : trimmed;
    }

    /** 표시용 loginId 배치 조회 — 컨트롤러의 응답 조립용(행당 쿼리 금지). */
    public Map<Long, String> loginIdsOf(Collection<Long> userIds) {
        return userAdminQueryRepository.findLoginIdsByUserIds(userIds);
    }

    private static PageRequest pageable(int page, int size, Sort sort) {
        return PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE), sort);
    }

}
