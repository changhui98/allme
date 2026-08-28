package com.allme.back.file;

import com.allme.back.file.application.port.FileStoragePort;
import com.allme.back.file.domain.FilePurpose;
import com.allme.back.file.domain.entity.UploadFile;
import com.allme.back.file.domain.entity.UploadTempFile;
import com.allme.back.file.domain.repository.UploadFileRepository;
import com.allme.back.file.domain.repository.UploadTempFileRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.test.util.ReflectionTestUtils;

/** file 도메인 단위 테스트용 인메모리 스텁 모음 — FileServiceTest·UserServiceTest 공용. */
public final class FileTestStubs {

    private FileTestStubs() {
    }

    public static class InMemoryUploadFileRepository implements UploadFileRepository {

        public final Map<Long, UploadFile> store = new LinkedHashMap<>();
        private long nextId = 1;

        @Override
        public UploadFile save(UploadFile uploadFile) {
            if (uploadFile.getId() == null) {
                ReflectionTestUtils.setField(uploadFile, "id", nextId++);
            }
            store.put(uploadFile.getId(), uploadFile);
            return uploadFile;
        }

        @Override
        public Optional<UploadFile> findById(Long id) {
            return Optional.ofNullable(store.get(id));
        }

        @Override
        public List<UploadFile> findAllByIdIn(Collection<Long> ids) {
            return ids.stream().map(store::get).filter(f -> f != null).toList();
        }

        @Override
        public void delete(UploadFile uploadFile) {
            store.remove(uploadFile.getId());
        }

    }

    public static class InMemoryUploadTempFileRepository implements UploadTempFileRepository {

        public final Map<Long, UploadTempFile> store = new LinkedHashMap<>();
        private long nextId = 1;

        @Override
        public UploadTempFile save(UploadTempFile tempFile) {
            if (tempFile.getId() == null) {
                ReflectionTestUtils.setField(tempFile, "id", nextId++);
            }
            store.put(tempFile.getId(), tempFile);
            return tempFile;
        }

        @Override
        public Optional<UploadTempFile> findById(Long id) {
            return Optional.ofNullable(store.get(id));
        }

        @Override
        public void delete(UploadTempFile tempFile) {
            store.remove(tempFile.getId());
        }

        @Override
        public List<UploadTempFile> findAllByPurposeAndCreatedDateBefore(
            FilePurpose purpose, LocalDateTime threshold
        ) {
            return store.values().stream()
                .filter(t -> t.getPurpose() == purpose)
                .filter(t -> t.getCreatedDate() != null && t.getCreatedDate().isBefore(threshold))
                .toList();
        }

        /** JPA @PrePersist 없이 생성 시각을 지정한다 (청소 유예 테스트용). */
        public static void setCreatedDate(UploadTempFile tempFile, LocalDateTime createdDate) {
            ReflectionTestUtils.setField(tempFile, "createdDate", createdDate);
        }

    }

    /** 저장·삭제 호출을 기록하는 스텁 스토리지 — store는 실제 구현처럼 중복 경로를 거부한다. */
    public static class RecordingFileStorage implements FileStoragePort {

        public final Map<String, byte[]> files = new LinkedHashMap<>();
        public final List<String> deleted = new ArrayList<>();

        @Override
        public void store(byte[] content, String relativePath) {
            if (files.containsKey(relativePath)) {
                throw new IllegalStateException("이미 존재하는 경로: " + relativePath);
            }
            files.put(relativePath, content);
        }

        @Override
        public void delete(String relativePath) {
            deleted.add(relativePath);
            files.remove(relativePath);
        }

    }

}
