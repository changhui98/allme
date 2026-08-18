package com.allme.back.file.application.port;

/**
 * 파일 바이너리 저장소 포트. 상대경로는 호출자(FileService)가 생성해 넘긴다 —
 * 임시 테이블에 경로를 먼저 커밋한 뒤 디스크에 쓰는 순서를 지키기 위함.
 * S3 도입 시 어댑터만 교체한다.
 */
public interface FileStoragePort {

    /** 내용을 상대경로에 저장한다. 같은 경로가 이미 있으면 덮어쓰지 않고 실패한다. */
    void store(byte[] content, String relativePath);

    /** 저장된 파일을 삭제한다. 없는 파일이어도 조용히 넘어간다(멱등). */
    void delete(String relativePath);

}
