package com.allme.back.inquiry.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.allme.back.global.exception.AppException;
import com.allme.back.inquiry.domain.InquiryErrorCode;
import com.allme.back.inquiry.domain.InquiryStatus;
import com.allme.back.inquiry.domain.entity.Inquiry;
import com.allme.back.inquiry.domain.repository.InquiryRepository;
import com.allme.back.user.domain.AdminUserRow;
import com.allme.back.user.domain.Role;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserAdminQueryRepository;
import com.allme.back.user.domain.repository.UserRepository;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

class InquiryServiceTest {

    /** 저장된 문의를 id 대신 참조로 돌려주는 인메모리 저장소 — id는 JPA가 부여하므로 null인 채 둔다 */
    private final List<Inquiry> saved = new ArrayList<>();

    private InquiryService serviceWith(User existingUser) {
        InquiryRepository inquiryRepository = new InquiryRepository() {
            @Override
            public Inquiry save(Inquiry inquiry) {
                saved.add(inquiry);
                return inquiry;
            }

            @Override
            public Optional<Inquiry> findById(Long id) {
                return saved.isEmpty() ? Optional.empty() : Optional.of(saved.get(0));
            }

            @Override
            public Optional<Inquiry> findByIdAndUserId(Long id, Long userId) {
                return saved.stream().filter(i -> i.getUserId().equals(userId)).findFirst();
            }

            @Override
            public Page<Inquiry> findPage(InquiryStatus statusOrNull, Pageable pageable) {
                return new PageImpl<>(saved);
            }

            @Override
            public Page<Inquiry> findPageByUserId(Long userId, Pageable pageable) {
                return new PageImpl<>(saved.stream().filter(i -> i.getUserId().equals(userId)).toList());
            }

            @Override
            public long countByStatus(InquiryStatus status) {
                return saved.stream().filter(i -> i.getStatus() == status).count();
            }
        };
        UserRepository userRepository = new UserRepository() {
            @Override
            public boolean existsByLoginId(String loginId) {
                return false;
            }

            @Override
            public boolean existsByCiHash(String ciHash) {
                return false;
            }

            @Override
            public boolean existsByNickname(String nickname) {
                return false;
            }

            @Override
            public List<User> findAllWithoutNickname() {
                return List.of();
            }

            @Override
            public Optional<User> findById(Long id) {
                return Optional.ofNullable(existingUser);
            }

            @Override
            public Optional<User> findByLoginId(String loginId) {
                return Optional.empty();
            }

            @Override
            public User save(User user) {
                return user;
            }
        };
        UserAdminQueryRepository adminQueryRepository = new UserAdminQueryRepository() {
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
        return new InquiryService(inquiryRepository, userRepository, adminQueryRepository);
    }

    private static User activeUser() {
        return User.create(
            "allme123", "encoded", "홍길동", "닉네임", "ci", "ci-hash", null, "01012345678", false);
    }

    @Test
    @DisplayName("활성 회원은 문의를 작성할 수 있고 답변 대기 상태로 저장된다")
    void submit_savesPending() {
        Inquiry inquiry = serviceWith(activeUser()).submit(1L, "제목", "내용");

        assertThat(saved).containsExactly(inquiry);
        assertThat(inquiry.getStatus()).isEqualTo(InquiryStatus.PENDING);
        assertThat(inquiry.getUserId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("탈퇴한 회원의 문의 작성은 U011로 차단된다")
    void submit_withdrawnUser_unauthorized() {
        User withdrawn = activeUser();
        withdrawn.withdraw();

        assertThatThrownBy(() -> serviceWith(withdrawn).submit(1L, "제목", "내용"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.UNAUTHORIZED);
    }

    @Test
    @DisplayName("존재하지 않는 회원의 문의 작성은 U011로 차단된다")
    void submit_unknownUser_unauthorized() {
        assertThatThrownBy(() -> serviceWith(null).submit(1L, "제목", "내용"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.UNAUTHORIZED);
    }

    @Test
    @DisplayName("타인의 문의를 내 문의로 조회하면 존재를 숨기고 I001을 던진다")
    void getMine_othersInquiry_notFound() {
        InquiryService service = serviceWith(activeUser());
        service.submit(1L, "제목", "내용");

        assertThatThrownBy(() -> service.getMine(2L, 1L))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(InquiryErrorCode.INQUIRY_NOT_FOUND);
    }

    @Test
    @DisplayName("관리자가 답변하면 미답변 수가 줄고 작성자 조회에 답변이 보인다")
    void answer_visibleToAuthor() {
        InquiryService service = serviceWith(activeUser());
        service.submit(1L, "제목", "내용");
        assertThat(service.countByStatus(InquiryStatus.PENDING)).isEqualTo(1);

        service.answer(1L, 99L, "답변입니다.");

        assertThat(service.countByStatus(InquiryStatus.PENDING)).isZero();
        assertThat(service.getMine(1L, 1L).getAnswer()).isEqualTo("답변입니다.");
    }

}
