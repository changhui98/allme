package com.allme.back.file.domain.repository;

import com.allme.back.file.domain.entity.UploadFile;
import java.util.Optional;

public interface UploadFileRepository {

    UploadFile save(UploadFile uploadFile);

    Optional<UploadFile> findById(Long id);

    void delete(UploadFile uploadFile);

}
