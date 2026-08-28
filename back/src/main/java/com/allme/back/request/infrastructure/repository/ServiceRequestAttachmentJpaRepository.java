package com.allme.back.request.infrastructure.repository;

import com.allme.back.request.domain.entity.ServiceRequestAttachment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRequestAttachmentJpaRepository extends JpaRepository<ServiceRequestAttachment, Long> {

    List<ServiceRequestAttachment> findAllByRequestIdOrderBySortOrderAsc(Long requestId);

}
