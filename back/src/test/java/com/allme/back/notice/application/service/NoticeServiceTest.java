package com.allme.back.notice.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.allme.back.global.exception.AppException;
import com.allme.back.notice.application.port.NoticeViewDedupPort;
import com.allme.back.notice.domain.NoticeErrorCode;
import com.allme.back.notice.domain.NoticeSort;
import com.allme.back.notice.domain.entity.Notice;
import com.allme.back.notice.domain.repository.NoticeRepository;
import com.allme.back.user.domain.AdminUserRow;
import com.allme.back.user.domain.Role;
import com.allme.back.user.domain.repository.UserAdminQueryRepository;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

class NoticeServiceTest {

    /** 조회수 증가 호출 횟수를 기록하는 인메모리 저장소 — 공지 1건만 담는다 */
    private static class StubNoticeRepository implements NoticeRepository {
        Notice stored;
        int incrementCalls;

        @Override
        public Notice save(Notice notice) {
            stored = notice;
            return notice;
        }

        @Override
        public Optional<Notice> findById(Long id) {
            return Optional.ofNullable(stored);
        }

        @Override
        public Optional<Notice> findPublishedById(Long id) {
            return Optional.ofNullable(stored).filter(Notice::isPublished);
        }

        @Override
        public Page<Notice> findAdminPage(Boolean publishedOrNull, String keywordOrNull, Pageable pageable) {
            return Page.empty();
        }

        @Override
        public Page<Notice> findPublishedPage(String keywordOrNull, Pageable pageable) {
            return Page.empty();
        }

        @Override
        public void incrementViewCount(Long id) {
            incrementCalls++;
        }
    }

    private static final UserAdminQueryRepository NO_USERS = new UserAdminQueryRepository() {
        @Override
        public Map<Long, String> findLoginIdsByUserIds(Collection<Long> userIds) {
            return Map.of();
        }

        @Override
        public Page<AdminUserRow> search(String loginIdKeywordOrNull, Pageable pageable) {
            return Page.empty();
        }

        @Override
        public Map<Long, Set<Role>> findRolesByUserIds(Collection<Long> userIds) {
            return Map.of();
        }

        @Override
        public long countActive() {
            return 0;
        }

        @Override
        public long countByRole(Role role) {
            return 0;
        }
    };

    private static NoticeService serviceWith(StubNoticeRepository repository, boolean firstView) {
        NoticeViewDedupPort dedup = (noticeId, viewerKey) -> firstView;
        return new NoticeService(repository, NO_USERS, dedup);
    }

    @Test
    @DisplayName("검색어는 앞뒤 공백을 제거하고, 비어 있으면 null(검색 없음)로 정규화한다")
    void normalizeKeyword_trimAndBlank() {
        assertThat(NoticeService.normalizeKeyword("  결제 ")).isEqualTo("결제");
        assertThat(NoticeService.normalizeKeyword("   ")).isNull();
        assertThat(NoticeService.normalizeKeyword("")).isNull();
        assertThat(NoticeService.normalizeKeyword(null)).isNull();
    }

    @Test
    @DisplayName("검색어가 100자를 넘으면 100자로 잘라 LIKE 패턴이 과대해지지 않게 한다")
    void normalizeKeyword_truncates() {
        String longKeyword = "가".repeat(150);

        assertThat(NoticeService.normalizeKeyword(longKeyword)).hasSize(100);
    }

    @Test
    @DisplayName("정렬은 어느 쪽이든 상단 고정이 먼저 오고, 조회순은 조회수 desc → id desc 순이다")
    void sortOf_pinnedFirst() {
        assertThat(NoticeService.sortOf(NoticeSort.LATEST).stream().map(Sort.Order::getProperty))
            .containsExactly("pinned", "id");
        assertThat(NoticeService.sortOf(NoticeSort.VIEWS).stream().map(Sort.Order::getProperty))
            .containsExactly("pinned", "viewCount", "id");
        assertThat(NoticeService.sortOf(NoticeSort.VIEWS).stream().map(Sort.Order::getDirection))
            .containsOnly(Sort.Direction.DESC);
    }

    @Test
    @DisplayName("24시간 창 안 첫 열람이면 조회수를 1회 올린다")
    void viewPublished_firstView_increments() {
        StubNoticeRepository repository = new StubNoticeRepository();
        repository.save(Notice.create(1L, "제목", "본문", true, false));

        serviceWith(repository, true).viewPublished(1L, "ip:127.0.0.1");

        assertThat(repository.incrementCalls).isEqualTo(1);
    }

    @Test
    @DisplayName("같은 열람자의 재열람(중복 방지 키 존재)이면 조회수를 올리지 않는다")
    void viewPublished_duplicate_noIncrement() {
        StubNoticeRepository repository = new StubNoticeRepository();
        repository.save(Notice.create(1L, "제목", "본문", true, false));

        Notice notice = serviceWith(repository, false).viewPublished(1L, "u:7");

        assertThat(repository.incrementCalls).isZero();
        assertThat(notice.getTitle()).isEqualTo("제목");
    }

    @Test
    @DisplayName("비공개 공지 열람은 N001이며 조회수도 올리지 않는다")
    void viewPublished_unpublished_notFound() {
        StubNoticeRepository repository = new StubNoticeRepository();
        repository.save(Notice.create(1L, "제목", "본문", false, false));

        assertThatThrownBy(() -> serviceWith(repository, true).viewPublished(1L, "u:7"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(NoticeErrorCode.NOTICE_NOT_FOUND);
        assertThat(repository.incrementCalls).isZero();
    }

}
