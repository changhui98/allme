package com.allme.back.request.infrastructure.repository;

import com.allme.back.request.domain.ServiceCategory;
import com.allme.back.request.domain.ServiceRequestStatus;
import com.allme.back.request.domain.entity.ServiceRequest;
import com.allme.back.request.domain.repository.ServiceRequestRepository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

/** 소프트 삭제(BaseEntity.deletedDate) 행은 모든 조회에서 제외한다(@SQLRestriction 미사용 관례). */
@Repository
@RequiredArgsConstructor
public class ServiceRequestRepositoryImpl implements ServiceRequestRepository {

    private final ServiceRequestJpaRepository jpaRepository;

    @Override
    public ServiceRequest save(ServiceRequest request) {
        return jpaRepository.save(request);
    }

    @Override
    public Optional<ServiceRequest> findById(Long id) {
        return jpaRepository.findByIdAndDeletedDateIsNull(id);
    }

    @Override
    public Optional<ServiceRequest> findByIdAndUserId(Long id, Long userId) {
        return jpaRepository.findByIdAndUserIdAndDeletedDateIsNull(id, userId);
    }

    @Override
    public Page<ServiceRequest> findPageByUserId(Long userId, Pageable pageable) {
        return jpaRepository.findByUserIdAndDeletedDateIsNull(userId, pageable);
    }

    /** 카테고리 유무를 분기해 메서드를 나눈다(조건을 한 쿼리로 합치지 않는 프로젝트 관례) */
    @Override
    public Page<ServiceRequest> findOpenPage(ServiceCategory categoryOrNull, Pageable pageable) {
        return categoryOrNull == null
            ? jpaRepository.findByStatusAndDeletedDateIsNull(ServiceRequestStatus.OPEN, pageable)
            : jpaRepository.findByStatusAndCategoryAndDeletedDateIsNull(
                ServiceRequestStatus.OPEN, categoryOrNull, pageable);
    }

    @Override
    public List<ServiceRequest> findAllByIdIn(Collection<Long> ids) {
        return ids.isEmpty() ? List.of() : jpaRepository.findByIdInAndDeletedDateIsNull(ids);
    }

}
