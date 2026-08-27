package com.allme.back.provider.infrastructure.repository;

import com.allme.back.provider.domain.entity.ProviderRevocation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProviderRevocationJpaRepository extends JpaRepository<ProviderRevocation, Long> {
}
