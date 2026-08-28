package com.allme.back.proposal.infrastructure.repository;

import com.allme.back.proposal.domain.ProposalStatus;
import com.allme.back.proposal.domain.entity.Proposal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProposalJpaRepository extends JpaRepository<Proposal, Long> {

    Optional<Proposal> findByIdAndRequestId(Long id, Long requestId);

    Optional<Proposal> findByRequestIdAndProviderUserId(Long requestId, Long providerUserId);

    List<Proposal> findAllByRequestIdOrderByIdDesc(Long requestId);

    List<Proposal> findAllByRequestIdAndStatus(Long requestId, ProposalStatus status);

    Page<Proposal> findByProviderUserId(Long providerUserId, Pageable pageable);

    long countByProviderUserIdAndStatus(Long providerUserId, ProposalStatus status);

}
