package com.allme.back.file.infrastructure.scheduler;

import com.allme.back.file.application.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 업로드 실패 등으로 임시 테이블에 남은 레코드(와 디스크 파일)를 주기적으로 청소한다.
 * 트리거만 담당하고 판단·삭제 로직은 FileService에 있다. 단일 인스턴스 배포 전제.
 */
@Component
@RequiredArgsConstructor
public class TempFileCleanupScheduler {

    private static final long CLEANUP_INTERVAL_MS = 10 * 60 * 1000L; // 10분

    private final FileService fileService;

    @Scheduled(fixedDelay = CLEANUP_INTERVAL_MS)
    public void cleanup() {
        fileService.cleanupExpiredTempFiles();
    }

}
