package com.allme.back.file.infrastructure.repository;

import com.allme.back.file.domain.entity.UploadTempFile;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UploadTempFileJpaRepository extends JpaRepository<UploadTempFile, Long> {

    List<UploadTempFile> findAllByCreatedDateBefore(LocalDateTime threshold);

}
