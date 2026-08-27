package com.allme.back.provider.infrastructure.repository;

import com.allme.back.provider.domain.entity.ProviderRevocation;
import com.allme.back.provider.domain.repository.ProviderRevocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ProviderRevocationRepositoryImpl implements ProviderRevocationRepository {

    private final ProviderRevocationJpaRepository jpaRepository;

    @Override
    public ProviderRevocation save(ProviderRevocation revocation) {
        return jpaRepository.save(revocation);
    }

}
