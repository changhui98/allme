package com.allme.back.provider.infrastructure.repository;

import com.allme.back.provider.domain.ApplicationStatus;
import com.allme.back.provider.domain.entity.ProviderApplication;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProviderApplicationJpaRepository extends JpaRepository<ProviderApplication, Long> {

    Optional<ProviderApplication> findTopByUserIdOrderByIdDesc(Long userId);

    boolean existsByUserIdAndStatus(Long userId, ApplicationStatus status);

    Optional<ProviderApplication> findTopByUserIdAndStatusOrderByIdDesc(Long userId, ApplicationStatus status);

    List<ProviderApplication> findByStatusAndUserIdInOrderByIdDesc(
        ApplicationStatus status, Collection<Long> userIds);

    Page<ProviderApplication> findByStatus(ApplicationStatus status, Pageable pageable);

    long countByStatus(ApplicationStatus status);

}
