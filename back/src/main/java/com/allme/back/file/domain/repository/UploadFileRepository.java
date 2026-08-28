package com.allme.back.file.domain.repository;

import com.allme.back.file.domain.entity.UploadFile;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UploadFileRepository {

    UploadFile save(UploadFile uploadFile);

    Optional<UploadFile> findById(Long id);

    /** 여러 파일 메타를 한 번에 — 첨부 목록 URL 조립 등 배치 조회용(행당 쿼리 금지) */
    List<UploadFile> findAllByIdIn(Collection<Long> ids);

    void delete(UploadFile uploadFile);

}
