package com.allme.back.proposal.application.service;

import com.allme.back.global.exception.AppException;
import com.allme.back.proposal.domain.ProposalErrorCode;
import com.allme.back.proposal.domain.ProposalStatus;
import com.allme.back.proposal.domain.entity.Proposal;
import com.allme.back.proposal.domain.repository.ProposalRepository;
import com.allme.back.request.domain.ServiceRequestErrorCode;
import com.allme.back.request.domain.entity.ServiceRequest;
import com.allme.back.request.domain.repository.ServiceRequestRepository;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserDisplayQueryRepository;
import com.allme.back.user.domain.repository.UserRepository;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 업체 제안 유스케이스 — 업체의 제안 등록·보낸 제안 조회, 클라이언트(요청 작성자)의 받은 제안 조회·수락·거절.
 * request·user 도메인에는 리포지토리 인터페이스로만 의존한다.
 * 수락은 요청 마감(CLOSED)과 나머지 제안 자동 거절을 한 트랜잭션으로 묶는다.
 */
@Service
@RequiredArgsConstructor
public class ProposalService {

    private static final int MAX_PAGE_SIZE = 50;

    private final ProposalRepository proposalRepository;
    private final ServiceRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final UserDisplayQueryRepository userDisplayQueryRepository;

    /**
     * 제안 등록 — 탈퇴·부재 회원 U011, 요청 없음 R001, 마감 B002, 내 요청 B003, 중복 B004.
     * 요청의 제안 수를 같은 트랜잭션에서 +1 한다.
     */
    @Transactional
    public Proposal submit(Long providerUserId, Long requestId, long amount, String message) {
        requireActiveUser(providerUserId);
        ServiceRequest request = requestRepository.findById(requestId)
            .orElseThrow(() -> new AppException(ServiceRequestErrorCode.REQUEST_NOT_FOUND));
        if (!request.isOpen()) {
            throw new AppException(ProposalErrorCode.REQUEST_NOT_OPEN);
        }
        if (request.getUserId().equals(providerUserId)) {
            throw new AppException(ProposalErrorCode.OWN_REQUEST);
        }
        if (proposalRepository.findByRequestIdAndProviderUserId(requestId, providerUserId).isPresent()) {
            throw new AppException(ProposalErrorCode.ALREADY_PROPOSED);
        }

        Proposal proposal = proposalRepository.save(Proposal.create(requestId, providerUserId, amount, message));
        request.increaseProposalCount();
        return proposal;
    }

    /** 요청 작성자의 받은 제안 목록 — 타인 요청은 존재를 숨기고 R001. 최신순. */
    public List<Proposal> getReceived(Long ownerUserId, Long requestId) {
        requireOwnedRequest(ownerUserId, requestId);
        return proposalRepository.findAllByRequestId(requestId);
    }

    /**
     * 제안 수락 — 요청 작성자만. 제안 PENDING(B005)·요청 OPEN(R007) 확인 후
     * 제안 ACCEPTED, 요청 CLOSED(+수락 제안 id), 같은 요청의 다른 PENDING 제안은 REJECTED.
     */
    @Transactional
    public Proposal accept(Long ownerUserId, Long requestId, Long proposalId) {
        ServiceRequest request = requireOwnedRequest(ownerUserId, requestId);
        Proposal proposal = getByIdAndRequestId(proposalId, requestId);

        proposal.accept();
        request.accept(proposal.getId());
        for (Proposal other : proposalRepository.findAllByRequestIdAndStatus(requestId, ProposalStatus.PENDING)) {
            if (!other.getId().equals(proposal.getId())) {
                other.reject();
            }
        }
        return proposal;
    }

    /** 제안 거절 — 요청 작성자만. 이미 처리된 제안은 B005. 요청 상태는 바꾸지 않는다. */
    @Transactional
    public Proposal reject(Long ownerUserId, Long requestId, Long proposalId) {
        requireOwnedRequest(ownerUserId, requestId);
        Proposal proposal = getByIdAndRequestId(proposalId, requestId);
        proposal.reject();
        return proposal;
    }

    /** 업체가 이 요청에 낸 제안 — 없으면 empty */
    public Optional<Proposal> findMine(Long providerUserId, Long requestId) {
        return proposalRepository.findByRequestIdAndProviderUserId(requestId, providerUserId);
    }

    /** 업체의 보낸 제안 목록 — 최신순 */
    public Page<Proposal> getMyPage(Long providerUserId, int page, int size) {
        return proposalRepository.findPageByProviderUserId(providerUserId, PageRequest.of(
            Math.max(page, 0),
            Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
            Sort.by(Sort.Direction.DESC, "id")
        ));
    }

    /** 업체의 계약 진행 수 — 수락된 제안 수(결제·완료 도메인 전까지의 대용 지표). 공개 프로필용. */
    public long countAcceptedByProvider(Long providerUserId) {
        return proposalRepository.countByProviderUserIdAndStatus(providerUserId, ProposalStatus.ACCEPTED);
    }

    /** 표시용 닉네임 배치 조회 — 업체명이 없는 업체(승인 신청서 없음)의 대체 표시명. */
    public Map<Long, String> nicknamesOf(Collection<Long> userIds) {
        return userDisplayQueryRepository.findNicknamesByUserIds(userIds);
    }

    private Proposal getByIdAndRequestId(Long proposalId, Long requestId) {
        return proposalRepository.findByIdAndRequestId(proposalId, requestId)
            .orElseThrow(() -> new AppException(ProposalErrorCode.PROPOSAL_NOT_FOUND));
    }

    private ServiceRequest requireOwnedRequest(Long ownerUserId, Long requestId) {
        return requestRepository.findByIdAndUserId(requestId, ownerUserId)
            .orElseThrow(() -> new AppException(ServiceRequestErrorCode.REQUEST_NOT_FOUND));
    }

    private void requireActiveUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(UserErrorCode.UNAUTHORIZED));
        if (user.isDeleted()) {
            throw new AppException(UserErrorCode.UNAUTHORIZED);
        }
    }

}
