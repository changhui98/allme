package com.allme.back.file.application.service;

import com.allme.back.file.application.port.FileStoragePort;
import com.allme.back.file.domain.FileErrorCode;
import com.allme.back.file.domain.FilePurpose;
import com.allme.back.file.domain.entity.UploadFile;
import com.allme.back.file.domain.entity.UploadTempFile;
import com.allme.back.file.domain.repository.UploadFileRepository;
import com.allme.back.file.domain.repository.UploadTempFileRepository;
import com.allme.back.global.exception.AppException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * 업로드 파일 유스케이스 — 임시 기록 → 디스크 저장 → 정식 승격의 2테이블 흐름을 담당한다.
 *
 * 사용 순서(호출자는 다른 도메인의 @Transactional 서비스):
 * 1. {@link #createTemp} — 별도 트랜잭션으로 임시 레코드를 먼저 커밋 (디스크에 쓰일 경로 확정)
 * 2. {@link #storeContent} — 디스크 기록
 * 3. {@link #promote} — 호출자 트랜잭션 안에서 정식 테이블로 승격 + 임시 레코드 삭제
 * 어느 단계에서 실패하든 임시 레코드가 남고, 청소 스케줄러가 디스크 파일과 함께 정리한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    private static final DateTimeFormatter FILE_TIMESTAMP =
        DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    /** 파일명 충돌 방지용 랜덤 suffix — 초 단위 타임스탬프와 조합하면 충돌 확률은 무시 가능 */
    private static final String RANDOM_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
    private static final int RANDOM_SUFFIX_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UploadFileRepository uploadFileRepository;
    private final UploadTempFileRepository uploadTempFileRepository;
    private final FileStoragePort fileStoragePort;
    private final Clock clock;

    /**
     * 임시 파일 레코드를 별도 트랜잭션으로 즉시 커밋한다 — 이후 단계가 실패해도
     * 레코드가 남아 스케줄러가 정리할 수 있다. 반드시 다른 빈에서 호출할 것(프록시 적용 조건).
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public UploadTempFile createTemp(
        FilePurpose purpose, String originalName, long size, String extension, Long uploaderId
    ) {
        String storedPath = generateStoredPath(purpose, extension);
        return uploadTempFileRepository.save(
            UploadTempFile.create(purpose, originalName, storedPath, size, extension, uploaderId));
    }

    /** 파일 내용을 디스크(스토리지)에 기록한다. 트랜잭션과 무관. */
    public void storeContent(UploadTempFile temp, byte[] content) {
        fileStoragePort.store(content, temp.getStoredPath());
    }

    /**
     * 임시 레코드를 정식 파일 테이블로 승격하고 임시 레코드를 지운다.
     * 호출자의 트랜잭션에 참여하므로, 호출자가 롤백되면 승격도 함께 취소되고
     * 임시 레코드가 되살아나 스케줄러가 디스크 파일까지 정리한다.
     *
     * @return 승격된 파일의 id
     */
    @Transactional
    public Long promote(Long tempFileId) {
        return promote(uploadTempFileRepository.findById(tempFileId)
            .orElseThrow(() -> new AppException(FileErrorCode.TEMP_FILE_NOT_FOUND)));
    }

    /**
     * 업로더·용도를 대조하는 승격 — 클라이언트가 임시 파일 id를 들고 나중에 제출하는 흐름
     * (서비스 요청 첨부 등)에서 타인의 임시 파일이나 다른 용도의 파일을 붙이는 것을 막는다.
     * 불일치도 존재를 숨기기 위해 같은 TEMP_FILE_NOT_FOUND로 응답한다.
     */
    @Transactional
    public Long promote(Long tempFileId, Long uploaderId, FilePurpose expectedPurpose) {
        UploadTempFile temp = uploadTempFileRepository.findById(tempFileId)
            .filter(t -> t.getUploaderId().equals(uploaderId) && t.getPurpose() == expectedPurpose)
            .orElseThrow(() -> new AppException(FileErrorCode.TEMP_FILE_NOT_FOUND));
        return promote(temp);
    }

    private Long promote(UploadTempFile temp) {
        UploadFile file = uploadFileRepository.save(UploadFile.promoteFrom(temp));
        uploadTempFileRepository.delete(temp);
        return file.getId();
    }

    /** 파일 id → 저장 상대경로. 레코드가 없으면 null — 깨진 참조를 "파일 없음"으로 관대하게 처리. */
    @Transactional(readOnly = true)
    public String getStoredPath(Long fileId) {
        return uploadFileRepository.findById(fileId)
            .map(UploadFile::getStoredPath)
            .orElse(null);
    }

    /** 여러 파일 id → 저장 상대경로 맵(배치 조회). 없는 id는 맵에서 빠진다. */
    @Transactional(readOnly = true)
    public Map<Long, String> getStoredPaths(Collection<Long> fileIds) {
        return uploadFileRepository.findAllByIdIn(fileIds).stream()
            .collect(Collectors.toMap(UploadFile::getId, UploadFile::getStoredPath));
    }

    /**
     * 파일 레코드를 삭제한다(멱등 — 없는 id면 무시). 디스크 파일은 트랜잭션 커밋 후에 지워
     * 롤백 시 파일이 보존되게 한다. 커밋 후 디스크 삭제 실패는 로그만 남는 고아 파일로,
     * 치명적이지 않다.
     */
    @Transactional
    public void remove(Long fileId) {
        uploadFileRepository.findById(fileId).ifPresent(file -> {
            uploadFileRepository.delete(file);
            deleteContentAfterCommit(file.getStoredPath());
        });
    }

    /**
     * 용도별 유예시간({@link FilePurpose#getTempRetention()})을 넘긴 임시 레코드를
     * 디스크 파일과 함께 삭제한다 (청소 스케줄러 진입점).
     */
    @Transactional
    public void cleanupExpiredTempFiles() {
        LocalDateTime now = LocalDateTime.now(clock);
        for (FilePurpose purpose : FilePurpose.values()) {
            LocalDateTime threshold = now.minus(purpose.getTempRetention());
            for (UploadTempFile temp
                : uploadTempFileRepository.findAllByPurposeAndCreatedDateBefore(purpose, threshold)) {
                // 디스크 먼저 지운다 — 중간에 죽어도 레코드가 남아 다음 주기에 재시도된다(멱등)
                fileStoragePort.delete(temp.getStoredPath());
                uploadTempFileRepository.delete(temp);
                log.info("[File] 만료 임시 파일 정리: {}", temp.getStoredPath());
            }
        }
    }

    private void deleteContentAfterCommit(String storedPath) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    fileStoragePort.delete(storedPath);
                }
            });
        } else {
            // 트랜잭션 동기화가 없는 경로(테스트 등) — 즉시 삭제로 폴백
            fileStoragePort.delete(storedPath);
        }
    }

    /** 저장 상대경로 생성: {용도}/{용도}_{yyyyMMddHHmmss}_{랜덤6자}.{확장자} */
    private String generateStoredPath(FilePurpose purpose, String extension) {
        String timestamp = LocalDateTime.now(clock).format(FILE_TIMESTAMP);
        return purpose.getDir() + "/"
            + purpose.getDir() + "_" + timestamp + "_" + randomSuffix() + "." + extension;
    }

    private String randomSuffix() {
        StringBuilder sb = new StringBuilder(RANDOM_SUFFIX_LENGTH);
        for (int i = 0; i < RANDOM_SUFFIX_LENGTH; i++) {
            sb.append(RANDOM_CHARS.charAt(RANDOM.nextInt(RANDOM_CHARS.length())));
        }
        return sb.toString();
    }

}
