package com.allme.back.file.infrastructure.repository;

import com.allme.back.file.domain.FilePurpose;
import com.allme.back.file.domain.entity.UploadTempFile;
import com.allme.back.file.domain.repository.UploadTempFileRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UploadTempFileRepositoryImpl implements UploadTempFileRepository {

    private final UploadTempFileJpaRepository uploadTempFileJpaRepository;

    @Override
    public UploadTempFile save(UploadTempFile tempFile) {
        return uploadTempFileJpaRepository.save(tempFile);
    }

    @Override
    public Optional<UploadTempFile> findById(Long id) {
        return uploadTempFileJpaRepository.findById(id);
    }

    @Override
    public void delete(UploadTempFile tempFile) {
        uploadTempFileJpaRepository.delete(tempFile);
    }

    @Override
    public List<UploadTempFile> findAllByPurposeAndCreatedDateBefore(
        FilePurpose purpose, LocalDateTime threshold
    ) {
        return uploadTempFileJpaRepository.findAllByPurposeAndCreatedDateBefore(purpose, threshold);
    }

}
