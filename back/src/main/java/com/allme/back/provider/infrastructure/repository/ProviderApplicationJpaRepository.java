package com.allme.back.provider.infrastructure.repository;

import com.allme.back.provider.domain.ApplicationStatus;
import com.allme.back.provider.domain.entity.ProviderApplication;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProviderApplicationJpaRepository extends JpaRepository<ProviderApplication, Long> {

    Optional<ProviderApplication> findTopByUserIdOrderByIdDesc(Long userId);

    boolean existsByUserIdAndStatus(Long userId, ApplicationStatus status);

    Page<ProviderApplication> findByStatus(ApplicationStatus status, Pageable pageable);

    long countByStatus(ApplicationStatus status);

}
