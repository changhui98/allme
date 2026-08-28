package com.allme.back.request.domain.repository;

import com.allme.back.request.domain.entity.ServiceRequestAttachment;
import java.util.List;

public interface ServiceRequestAttachmentRepository {

    List<ServiceRequestAttachment> saveAll(List<ServiceRequestAttachment> attachments);

    List<ServiceRequestAttachment> findAllByRequestIdOrderBySortOrder(Long requestId);

}
