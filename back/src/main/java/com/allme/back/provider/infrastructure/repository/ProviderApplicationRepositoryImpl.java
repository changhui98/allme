package com.allme.back.provider.infrastructure.repository;

import com.allme.back.provider.domain.ApplicationStatus;
import com.allme.back.provider.domain.entity.ProviderApplication;
import com.allme.back.provider.domain.repository.ProviderApplicationRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ProviderApplicationRepositoryImpl implements ProviderApplicationRepository {

    private final ProviderApplicationJpaRepository jpaRepository;

    @Override
    public ProviderApplication save(ProviderApplication application) {
        return jpaRepository.save(application);
    }

    @Override
    public Optional<ProviderApplication> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public Optional<ProviderApplication> findLatestByUserId(Long userId) {
        return jpaRepository.findTopByUserIdOrderByIdDesc(userId);
    }

    @Override
    public boolean existsByUserIdAndStatus(Long userId, ApplicationStatus status) {
        return jpaRepository.existsByUserIdAndStatus(userId, status);
    }

    @Override
    public Page<ProviderApplication> findPage(ApplicationStatus statusOrNull, Pageable pageable) {
        return statusOrNull != null
            ? jpaRepository.findByStatus(statusOrNull, pageable)
            : jpaRepository.findAll(pageable);
    }

    @Override
    public long countByStatus(ApplicationStatus status) {
        return jpaRepository.countByStatus(status);
    }

    @Override
    public long count() {
        return jpaRepository.count();
    }

}
