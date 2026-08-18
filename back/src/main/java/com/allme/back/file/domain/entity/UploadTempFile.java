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
 * 업로드 임시 파일 엔티티 — 디스크 기록 전에 별도 트랜잭션으로 선기록되고,
 * 업로드가 정상 완결되면 {@link UploadFile}로 승격되며 삭제된다.
 * 실패로 남은 레코드는 청소 스케줄러가 디스크 파일과 함께 지운다.
 */
@Entity
@Table(name = "upload_temp_files")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UploadTempFile extends BaseEntity {

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

    private UploadTempFile(
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

    public static UploadTempFile create(
        FilePurpose purpose, String originalName, String storedPath,
        long size, String extension, Long uploaderId
    ) {
        return new UploadTempFile(purpose, originalName, storedPath, size, extension, uploaderId);
    }

}
