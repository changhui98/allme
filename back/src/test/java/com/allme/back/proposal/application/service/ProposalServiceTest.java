package com.allme.back.proposal.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.allme.back.global.exception.AppException;
import com.allme.back.proposal.domain.ProposalErrorCode;
import com.allme.back.proposal.domain.ProposalStatus;
import com.allme.back.proposal.domain.entity.Proposal;
import com.allme.back.proposal.domain.repository.ProposalRepository;
import com.allme.back.request.domain.Region;
import com.allme.back.request.domain.ServiceCategory;
import com.allme.back.request.domain.ServiceRequestErrorCode;
import com.allme.back.request.domain.ServiceRequestStatus;
import com.allme.back.request.domain.entity.ServiceRequest;
import com.allme.back.request.domain.repository.ServiceRequestRepository;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

class ProposalServiceTest {

    private static final long OWNER = 1L;
    private static final long PROVIDER_A = 2L;
    private static final long PROVIDER_B = 3L;

    private final List<ServiceRequest> requests = new ArrayList<>();
    private final List<Proposal> proposals = new ArrayList<>();

    private ProposalService serviceWith(User existingUser) {
        ProposalRepository proposalRepository = new ProposalRepository() {
            private long nextId = 1;
            @Override public Proposal save(Proposal proposal) {
                ReflectionTestUtils.setField(proposal, "id", nextId++);
                proposals.add(proposal);
                return proposal;
            }
            @Override public Optional<Proposal> findByIdAndRequestId(Long id, Long requestId) {
                return proposals.stream()
                    .filter(p -> p.getId().equals(id) && p.getRequestId().equals(requestId)).findFirst();
            }
            @Override public Optional<Proposal> findByRequestIdAndProviderUserId(Long requestId, Long providerUserId) {
                return proposals.stream()
                    .filter(p -> p.getRequestId().equals(requestId) && p.getProviderUserId().equals(providerUserId))
                    .findFirst();
            }
            @Override public List<Proposal> findAllByRequestId(Long requestId) {
                return proposals.stream().filter(p -> p.getRequestId().equals(requestId))
                    .sorted(Comparator.comparingLong(Proposal::getId).reversed()).toList();
            }
            @Override public List<Proposal> findAllByRequestIdAndStatus(Long requestId, ProposalStatus status) {
                return proposals.stream()
                    .filter(p -> p.getRequestId().equals(requestId) && p.getStatus() == status).toList();
            }
            @Override public Page<Proposal> findPageByProviderUserId(Long providerUserId, Pageable pageable) {
                return new PageImpl<>(proposals.stream().filter(p -> p.getProviderUserId().equals(providerUserId)).toList());
            }
            @Override public long countByProviderUserIdAndStatus(Long providerUserId, ProposalStatus status) {
                return proposals.stream()
                    .filter(p -> p.getProviderUserId().equals(providerUserId) && p.getStatus() == status).count();
            }
        };
        ServiceRequestRepository requestRepository = new ServiceRequestRepository() {
            @Override public ServiceRequest save(ServiceRequest request) { return request; }
            @Override public Optional<ServiceRequest> findById(Long id) {
                return requests.stream().filter(r -> r.getId().equals(id)).findFirst();
            }
            @Override public Optional<ServiceRequest> findByIdAndUserId(Long id, Long userId) {
                return requests.stream().filter(r -> r.getId().equals(id) && r.getUserId().equals(userId)).findFirst();
            }
            @Override public Page<ServiceRequest> findPageByUserId(Long userId, Pageable pageable) { return Page.empty(); }
            @Override public Page<ServiceRequest> findOpenPage(ServiceCategory c, Pageable pageable) { return Page.empty(); }
            @Override public List<ServiceRequest> findAllByIdIn(Collection<Long> ids) { return List.of(); }
        };
        UserRepository userRepository = new UserRepository() {
            @Override public boolean existsByLoginId(String loginId) { return false; }
            @Override public boolean existsByCiHash(String ciHash) { return false; }
            @Override public boolean existsByNickname(String nickname) { return false; }
            @Override public List<User> findAllWithoutNickname() { return List.of(); }
            @Override public Optional<User> findById(Long id) { return Optional.ofNullable(existingUser); }
            @Override public Optional<User> findByLoginId(String loginId) { return Optional.empty(); }
            @Override public User save(User user) { return user; }
        };
        return new ProposalService(proposalRepository, requestRepository, userRepository, userIds -> java.util.Map.of());
    }

    private static User activeUser() {
        return User.create(
            "allme123", "encoded", "홍길동", "닉네임", "ci", "ci-hash", null, "01012345678", false);
    }

    private ServiceRequest openRequest(long id) {
        ServiceRequest request = ServiceRequest.create(
            OWNER, ServiceCategory.CLEANING, "제목", "내용", Region.GWANAK, null,
            LocalDate.of(2026, 9, 1), false, 100_000L, 200_000L, false, null);
        ReflectionTestUtils.setField(request, "id", id);
        requests.add(request);
        return request;
    }

    @Test
    @DisplayName("업체가 제안하면 대기 상태로 저장되고 요청의 제안 수가 늘어난다")
    void submit_savesPendingAndCounts() {
        ServiceRequest request = openRequest(10L);
        ProposalService service = serviceWith(activeUser());

        Proposal proposal = service.submit(PROVIDER_A, 10L, 150_000L, "해드릴게요");

        assertThat(proposal.getStatus()).isEqualTo(ProposalStatus.PENDING);
        assertThat(request.getProposalCount()).isEqualTo(1);
        assertThat(service.findMine(PROVIDER_A, 10L)).contains(proposal);
    }

    @Test
    @DisplayName("없는 요청 R001, 내 요청 B003, 중복 제안 B004, 마감된 요청 B002")
    void submit_guards() {
        ServiceRequest request = openRequest(10L);
        ProposalService service = serviceWith(activeUser());
        service.submit(PROVIDER_A, 10L, 150_000L, "m");

        assertThatThrownBy(() -> service.submit(PROVIDER_A, 99L, 1L, "m"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceRequestErrorCode.REQUEST_NOT_FOUND);
        assertThatThrownBy(() -> service.submit(OWNER, 10L, 1L, "m"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ProposalErrorCode.OWN_REQUEST);
        assertThatThrownBy(() -> service.submit(PROVIDER_A, 10L, 1L, "m"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ProposalErrorCode.ALREADY_PROPOSED);

        request.accept(1L);
        assertThatThrownBy(() -> service.submit(PROVIDER_B, 10L, 1L, "m"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ProposalErrorCode.REQUEST_NOT_OPEN);
    }

    @Test
    @DisplayName("탈퇴한 회원의 제안은 U011로 차단된다")
    void submit_withdrawnUser() {
        openRequest(10L);
        User withdrawn = activeUser();
        withdrawn.withdraw();

        assertThatThrownBy(() -> serviceWith(withdrawn).submit(PROVIDER_A, 10L, 1L, "m"))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.UNAUTHORIZED);
    }

    @Test
    @DisplayName("수락하면 그 제안은 ACCEPTED, 요청은 CLOSED, 다른 대기 제안은 REJECTED가 되고 재수락은 B005")
    void accept_closesRequestAndRejectsOthers() {
        ServiceRequest request = openRequest(10L);
        ProposalService service = serviceWith(activeUser());
        Proposal a = service.submit(PROVIDER_A, 10L, 150_000L, "a");
        Proposal b = service.submit(PROVIDER_B, 10L, 120_000L, "b");

        service.accept(OWNER, 10L, b.getId());

        assertThat(b.getStatus()).isEqualTo(ProposalStatus.ACCEPTED);
        assertThat(a.getStatus()).isEqualTo(ProposalStatus.REJECTED);
        assertThat(request.getStatus()).isEqualTo(ServiceRequestStatus.CLOSED);
        assertThat(request.getAcceptedProposalId()).isEqualTo(b.getId());
        assertThat(service.getReceived(OWNER, 10L)).containsExactly(b, a);
        assertThat(service.countAcceptedByProvider(PROVIDER_B)).isEqualTo(1);
        assertThat(service.countAcceptedByProvider(PROVIDER_A)).isZero();

        assertThatThrownBy(() -> service.accept(OWNER, 10L, a.getId()))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ProposalErrorCode.ALREADY_DECIDED);
    }

    @Test
    @DisplayName("타인 요청의 제안 조회·수락·거절은 존재를 숨기고 R001, 다른 요청의 제안 id는 B001")
    void ownerGuards() {
        openRequest(10L);
        openRequest(11L);
        ProposalService service = serviceWith(activeUser());
        Proposal a = service.submit(PROVIDER_A, 10L, 1L, "a");

        assertThatThrownBy(() -> service.getReceived(PROVIDER_B, 10L))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceRequestErrorCode.REQUEST_NOT_FOUND);
        assertThatThrownBy(() -> service.accept(PROVIDER_B, 10L, a.getId()))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceRequestErrorCode.REQUEST_NOT_FOUND);
        assertThatThrownBy(() -> service.reject(OWNER, 11L, a.getId()))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ProposalErrorCode.PROPOSAL_NOT_FOUND);

        service.reject(OWNER, 10L, a.getId());
        assertThat(a.getStatus()).isEqualTo(ProposalStatus.REJECTED);
        assertThat(service.getMyPage(PROVIDER_A, 0, 20).getContent()).containsExactly(a);
    }

}
