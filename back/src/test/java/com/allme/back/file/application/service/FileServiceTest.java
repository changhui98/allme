package com.allme.back.file.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.allme.back.file.FileTestStubs.InMemoryUploadFileRepository;
import com.allme.back.file.FileTestStubs.InMemoryUploadTempFileRepository;
import com.allme.back.file.FileTestStubs.RecordingFileStorage;
import com.allme.back.file.domain.FileErrorCode;
import com.allme.back.file.domain.FilePurpose;
import com.allme.back.file.domain.entity.UploadFile;
import com.allme.back.file.domain.entity.UploadTempFile;
import com.allme.back.global.exception.AppException;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class FileServiceTest {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final LocalDateTime FIXED_NOW = LocalDateTime.of(2026, 8, 18, 14, 30, 12);
    private static final Clock FIXED_CLOCK =
        Clock.fixed(FIXED_NOW.atZone(KST).toInstant(), KST);

    private final InMemoryUploadFileRepository fileRepository = new InMemoryUploadFileRepository();
    private final InMemoryUploadTempFileRepository tempRepository =
        new InMemoryUploadTempFileRepository();
    private final RecordingFileStorage storage = new RecordingFileStorage();

    private final FileService fileService =
        new FileService(fileRepository, tempRepository, storage, FIXED_CLOCK);

    @Test
    @DisplayName("임시 파일 생성 시 저장경로가 {용도}/{용도}_{일시}_{랜덤6자}.{확장자} 형식으로 만들어진다")
    void createTemp_generatesCodenamePath() {
        UploadTempFile temp =
            fileService.createTemp(FilePurpose.PROFILE, "내사진.jpg", 3L, "jpg", 7L);

        assertThat(temp.getStoredPath())
            .matches("profile/profile_20260818143012_[a-z0-9]{6}\\.jpg");
        assertThat(temp.getOriginalName()).isEqualTo("내사진.jpg");
        assertThat(temp.getSize()).isEqualTo(3L);
        assertThat(temp.getUploaderId()).isEqualTo(7L);
        assertThat(tempRepository.store).containsKey(temp.getId());
    }

    @Test
    @DisplayName("승격하면 임시 레코드의 메타데이터가 파일 테이블로 복사되고 임시 레코드는 삭제된다")
    void promote_movesTempToFile() {
        UploadTempFile temp =
            fileService.createTemp(FilePurpose.PROFILE, "내사진.jpg", 3L, "jpg", 7L);

        Long fileId = fileService.promote(temp.getId());

        UploadFile file = fileRepository.store.get(fileId);
        assertThat(file.getPurpose()).isEqualTo(FilePurpose.PROFILE);
        assertThat(file.getOriginalName()).isEqualTo("내사진.jpg");
        assertThat(file.getStoredPath()).isEqualTo(temp.getStoredPath());
        assertThat(file.getSize()).isEqualTo(3L);
        assertThat(file.getExtension()).isEqualTo("jpg");
        assertThat(file.getUploaderId()).isEqualTo(7L);
        assertThat(tempRepository.store).isEmpty();
    }

    @Test
    @DisplayName("없는 임시 파일 id를 승격하면 TEMP_FILE_NOT_FOUND 예외를 던진다")
    void promote_unknownTempId() {
        assertThatThrownBy(() -> fileService.promote(999L))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(FileErrorCode.TEMP_FILE_NOT_FOUND);
    }

    @Test
    @DisplayName("저장경로 조회 — 있으면 경로, 없으면 null을 반환한다")
    void getStoredPath() {
        UploadTempFile temp =
            fileService.createTemp(FilePurpose.PROFILE, null, 1L, "png", 1L);
        Long fileId = fileService.promote(temp.getId());

        assertThat(fileService.getStoredPath(fileId)).isEqualTo(temp.getStoredPath());
        assertThat(fileService.getStoredPath(999L)).isNull();
    }

    @Test
    @DisplayName("파일 삭제 시 레코드와 디스크 파일이 함께 지워지고, 없는 id는 무시한다(멱등)")
    void remove() {
        UploadTempFile temp =
            fileService.createTemp(FilePurpose.PROFILE, null, 1L, "png", 1L);
        fileService.storeContent(temp, new byte[] {1});
        Long fileId = fileService.promote(temp.getId());

        fileService.remove(fileId);
        fileService.remove(999L);

        assertThat(fileRepository.store).isEmpty();
        assertThat(storage.deleted).containsExactly(temp.getStoredPath());
    }

    @Test
    @DisplayName("청소 시 유예시간(1시간)을 넘긴 임시 레코드만 디스크 파일과 함께 삭제된다")
    void cleanupExpiredTempFiles() {
        UploadTempFile expired =
            fileService.createTemp(FilePurpose.PROFILE, null, 1L, "png", 1L);
        fileService.storeContent(expired, new byte[] {1});
        InMemoryUploadTempFileRepository.setCreatedDate(expired, FIXED_NOW.minusHours(2));

        UploadTempFile fresh =
            fileService.createTemp(FilePurpose.PROFILE, null, 1L, "png", 1L);
        InMemoryUploadTempFileRepository.setCreatedDate(fresh, FIXED_NOW.minusMinutes(5));

        fileService.cleanupExpiredTempFiles();

        assertThat(tempRepository.store).containsOnlyKeys(fresh.getId());
        assertThat(storage.deleted).containsExactly(expired.getStoredPath());
    }

}
