package com.allme.back.file.infrastructure.repository;

import com.allme.back.file.domain.entity.UploadFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UploadFileJpaRepository extends JpaRepository<UploadFile, Long> {

}
