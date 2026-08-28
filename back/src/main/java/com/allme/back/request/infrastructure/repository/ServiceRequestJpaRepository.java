package com.allme.back.request.infrastructure.repository;

import com.allme.back.request.domain.ServiceCategory;
import com.allme.back.request.domain.ServiceRequestStatus;
import com.allme.back.request.domain.entity.ServiceRequest;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRequestJpaRepository extends JpaRepository<ServiceRequest, Long> {

    Optional<ServiceRequest> findByIdAndDeletedDateIsNull(Long id);

    Optional<ServiceRequest> findByIdAndUserIdAndDeletedDateIsNull(Long id, Long userId);

    Page<ServiceRequest> findByUserIdAndDeletedDateIsNull(Long userId, Pageable pageable);

    Page<ServiceRequest> findByStatusAndDeletedDateIsNull(ServiceRequestStatus status, Pageable pageable);

    Page<ServiceRequest> findByStatusAndCategoryAndDeletedDateIsNull(
        ServiceRequestStatus status, ServiceCategory category, Pageable pageable);

    List<ServiceRequest> findByIdInAndDeletedDateIsNull(Collection<Long> ids);

}
