package com.allme.back.proposal.infrastructure.repository;

import com.allme.back.proposal.domain.ProposalStatus;
import com.allme.back.proposal.domain.entity.Proposal;
import com.allme.back.proposal.domain.repository.ProposalRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ProposalRepositoryImpl implements ProposalRepository {

    private final ProposalJpaRepository jpaRepository;

    @Override
    public Proposal save(Proposal proposal) {
        return jpaRepository.save(proposal);
    }

    @Override
    public Optional<Proposal> findByIdAndRequestId(Long id, Long requestId) {
        return jpaRepository.findByIdAndRequestId(id, requestId);
    }

    @Override
    public Optional<Proposal> findByRequestIdAndProviderUserId(Long requestId, Long providerUserId) {
        return jpaRepository.findByRequestIdAndProviderUserId(requestId, providerUserId);
    }

    @Override
    public List<Proposal> findAllByRequestId(Long requestId) {
        return jpaRepository.findAllByRequestIdOrderByIdDesc(requestId);
    }

    @Override
    public List<Proposal> findAllByRequestIdAndStatus(Long requestId, ProposalStatus status) {
        return jpaRepository.findAllByRequestIdAndStatus(requestId, status);
    }

    @Override
    public Page<Proposal> findPageByProviderUserId(Long providerUserId, Pageable pageable) {
        return jpaRepository.findByProviderUserId(providerUserId, pageable);
    }

    @Override
    public long countByProviderUserIdAndStatus(Long providerUserId, ProposalStatus status) {
        return jpaRepository.countByProviderUserIdAndStatus(providerUserId, status);
    }

}
