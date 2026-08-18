package com.allme.back.file.domain.repository;

import com.allme.back.file.domain.entity.UploadTempFile;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UploadTempFileRepository {

    UploadTempFile save(UploadTempFile tempFile);

    Optional<UploadTempFile> findById(Long id);

    void delete(UploadTempFile tempFile);

    /** 청소 스케줄러용 — 기준 시각 이전에 생성돼 아직 승격되지 못한 임시 레코드 조회 */
    List<UploadTempFile> findAllByCreatedDateBefore(LocalDateTime threshold);

}
