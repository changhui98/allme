package com.allme.back.request.domain.entity;

import com.allme.back.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 서비스 요청의 참고 사진 — 요청·파일 모두 JPA 연관 없이 id로만 참조한다
 * (open-in-view: false, file 도메인은 id 참조만 허용). 표시 순서는 sortOrder.
 */
@Entity
@Table(
    name = "service_request_attachments",
    indexes = @Index(name = "idx_service_request_attachments_request_id", columnList = "request_id")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ServiceRequestAttachment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false)
    private Long requestId;

    /** upload_files.id */
    @Column(name = "file_id", nullable = false)
    private Long fileId;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    private ServiceRequestAttachment(Long requestId, Long fileId, int sortOrder) {
        this.requestId = requestId;
        this.fileId = fileId;
        this.sortOrder = sortOrder;
    }

    public static ServiceRequestAttachment create(Long requestId, Long fileId, int sortOrder) {
        return new ServiceRequestAttachment(requestId, fileId, sortOrder);
    }

}
