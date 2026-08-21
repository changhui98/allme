package com.allme.back.provider.domain.repository;

import com.allme.back.provider.domain.ApplicationStatus;
import com.allme.back.provider.domain.entity.ProviderApplication;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProviderApplicationRepository {

    ProviderApplication save(ProviderApplication application);

    Optional<ProviderApplication> findById(Long id);

    /** 내 신청 조회는 최신 1건 기준 — 반려 후 재신청하면 새 행이 최신이 된다. */
    Optional<ProviderApplication> findLatestByUserId(Long userId);

    boolean existsByUserIdAndStatus(Long userId, ApplicationStatus status);

    /** status가 null이면 전체 조회. 정렬은 id desc(신청 최신순) 고정. */
    Page<ProviderApplication> findPage(ApplicationStatus statusOrNull, Pageable pageable);

    long countByStatus(ApplicationStatus status);

    long count();

}
