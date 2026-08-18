package com.allme.back.file.infrastructure.repository;

import com.allme.back.file.domain.entity.UploadFile;
import com.allme.back.file.domain.repository.UploadFileRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UploadFileRepositoryImpl implements UploadFileRepository {

    private final UploadFileJpaRepository uploadFileJpaRepository;

    @Override
    public UploadFile save(UploadFile uploadFile) {
        return uploadFileJpaRepository.save(uploadFile);
    }

    @Override
    public Optional<UploadFile> findById(Long id) {
        return uploadFileJpaRepository.findById(id);
    }

    @Override
    public void delete(UploadFile uploadFile) {
        uploadFileJpaRepository.delete(uploadFile);
    }

}
