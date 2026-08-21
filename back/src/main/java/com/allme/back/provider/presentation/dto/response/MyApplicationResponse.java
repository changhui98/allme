package com.allme.back.provider.presentation.dto.response;

import com.allme.back.provider.domain.entity.ProviderApplication;
import java.time.LocalDateTime;

/** 신청자 본인에게 내려주는 신청 내역 — 처리자(관리자) 정보는 노출하지 않는다. */
public record MyApplicationResponse(
    Long id,
    String businessName,
    String businessRegistrationNumber,
    String introduction,
    String contactPhone,
    String status,
    String rejectReason,
    LocalDateTime createdDate,
    LocalDateTime processedDate
) {

    public static MyApplicationResponse from(ProviderApplication application) {
        return new MyApplicationResponse(
            application.getId(),
            application.getBusinessName(),
            application.getBusinessRegistrationNumber(),
            application.getIntroduction(),
            application.getContactPhone(),
            application.getStatus().name(),
            application.getRejectReason(),
            application.getCreatedDate(),
            application.getProcessedDate()
        );
    }

}
