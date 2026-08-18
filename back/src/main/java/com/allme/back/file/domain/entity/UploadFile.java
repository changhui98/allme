package com.allme.back.file.domain.entity;

import com.allme.back.file.domain.FilePurpose;
import com.allme.back.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 업로드 파일 엔티티 — 업로드가 정상 완결된 파일의 메타데이터 단일 출처.
 * 다른 도메인은 이 엔티티를 JPA 연관 없이 id(Long)로만 참조한다.
 * 삭제는 하드 삭제 — 디스크 파일과의 정합을 단순하게 유지하기 위함.
 */
@Entity
@Table(name = "upload_files")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UploadFile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FilePurpose purpose;

    /** 업로드 당시의 원본 파일명. 브라우저가 안 줄 수 있어 nullable. */
    @Column(name = "original_name", length = 255)
    private String originalName;

    /** 서버가 생성한 저장 상대경로 (예: profile/profile_20260818143012_a1b2c3.jpg) */
    @Column(name = "stored_path", nullable = false, length = 255)
    private String storedPath;

    @Column(nullable = false)
    private long size;

    @Column(nullable = false, length = 10)
    private String extension;

    @Column(name = "uploader_id", nullable = false)
    private Long uploaderId;

    private UploadFile(
        FilePurpose purpose, String originalName, String storedPath,
        long size, String extension, Long uploaderId
    ) {
        this.purpose = purpose;
        this.originalName = originalName;
        this.storedPath = storedPath;
        this.size = size;
        this.extension = extension;
        this.uploaderId = uploaderId;
    }

    /** 임시 파일의 메타데이터를 그대로 복사해 정식 파일로 승격한다. */
    public static UploadFile promoteFrom(UploadTempFile temp) {
        return new UploadFile(
            temp.getPurpose(),
            temp.getOriginalName(),
            temp.getStoredPath(),
            temp.getSize(),
            temp.getExtension(),
            temp.getUploaderId()
        );
    }

}
