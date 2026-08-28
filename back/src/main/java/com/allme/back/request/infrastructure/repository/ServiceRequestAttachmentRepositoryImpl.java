package com.allme.back.request.infrastructure.repository;

import com.allme.back.request.domain.entity.ServiceRequestAttachment;
import com.allme.back.request.domain.repository.ServiceRequestAttachmentRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ServiceRequestAttachmentRepositoryImpl implements ServiceRequestAttachmentRepository {

    private final ServiceRequestAttachmentJpaRepository jpaRepository;

    @Override
    public List<ServiceRequestAttachment> saveAll(List<ServiceRequestAttachment> attachments) {
        return jpaRepository.saveAll(attachments);
    }

    @Override
    public List<ServiceRequestAttachment> findAllByRequestIdOrderBySortOrder(Long requestId) {
        return jpaRepository.findAllByRequestIdOrderBySortOrderAsc(requestId);
    }

}
