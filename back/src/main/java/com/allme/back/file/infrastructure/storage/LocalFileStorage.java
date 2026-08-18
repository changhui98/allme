package com.allme.back.file.infrastructure.storage;

import com.allme.back.file.application.port.FileStoragePort;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 로컬 파일시스템 저장소.
 * 저장 위치: {app.images-root}/{상대경로} — 저장소 루트의 images/ 폴더(front·back과 나란히,
 * 도커에서는 ./images:/images 볼륨). S3 도입 시 이 어댑터만 교체한다.
 */
@Slf4j
@Component
public class LocalFileStorage implements FileStoragePort {

    private final Path imagesRoot;

    public LocalFileStorage(@Value("${app.images-root}") String imagesRoot) {
        this.imagesRoot = Path.of(imagesRoot).toAbsolutePath().normalize();
    }

    @Override
    public void store(byte[] content, String relativePath) {
        Path target = resolveInsideRoot(relativePath);
        if (target == null) {
            throw new IllegalArgumentException("images 루트 밖 경로에는 저장할 수 없습니다: " + relativePath);
        }
        try {
            Files.createDirectories(target.getParent());
            // CREATE_NEW: 같은 경로가 이미 있으면 덮어쓰지 않고 실패 — 파일명 충돌의 최종 방어선
            Files.write(target, content, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);
        } catch (IOException e) {
            throw new UncheckedIOException("파일 저장에 실패했습니다: " + target, e);
        }
    }

    @Override
    public void delete(String relativePath) {
        Path target = resolveInsideRoot(relativePath);
        if (target == null) {
            log.warn("[File] images 루트 밖 경로 삭제 시도 무시: {}", relativePath);
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            // 교체·청소 흐름에서 파일 삭제 실패는 치명적이지 않다 — 로그만 남긴다
            log.warn("[File] 파일 삭제 실패: {}", target, e);
        }
    }

    /** 상대경로가 루트를 벗어나지 않는지 확인 — DB 값이 오염돼도 외부 파일을 건드리지 않게 */
    private Path resolveInsideRoot(String relativePath) {
        Path target = imagesRoot.resolve(relativePath).normalize();
        return target.startsWith(imagesRoot) ? target : null;
    }

}
