package com.allme.back.proposal.domain.repository;

import com.allme.back.proposal.domain.ProposalStatus;
import com.allme.back.proposal.domain.entity.Proposal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProposalRepository {

    Proposal save(Proposal proposal);

    /** 요청 소속 확인을 겸한 조회 — 다른 요청의 제안은 empty */
    Optional<Proposal> findByIdAndRequestId(Long id, Long requestId);

    Optional<Proposal> findByRequestIdAndProviderUserId(Long requestId, Long providerUserId);

    /** 요청의 제안 목록 — 최신순 */
    List<Proposal> findAllByRequestId(Long requestId);

    List<Proposal> findAllByRequestIdAndStatus(Long requestId, ProposalStatus status);

    Page<Proposal> findPageByProviderUserId(Long providerUserId, Pageable pageable);

    /** 업체의 상태별 제안 수 — 공개 프로필의 "계약 진행" 수(ACCEPTED) 등 */
    long countByProviderUserIdAndStatus(Long providerUserId, ProposalStatus status);

}
