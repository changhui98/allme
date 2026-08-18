package com.allme.back.user.application.port;

import java.time.LocalDateTime;

/**
 * 탈퇴 회원 보관소 포트 — 별도 물리 DB로 개인정보를 이관한다.
 * (구현체: infrastructure의 JDBC 어댑터)
 *
 * 호출 계약: 본 DB 트랜잭션 커밋 전에 호출되어 먼저 커밋된다(자체 커넥션).
 * 실패하면 예외를 던져 탈퇴 전체를 중단시킨다 — 원본이 본 DB에 그대로 남으므로
 * 어떤 실패 모드에서도 데이터 유실이 없고, 재시도는 userId upsert로 안전하다.
 */
public interface WithdrawnUserArchivePort {

    /** 탈퇴 회원 1건을 보관소에 저장(같은 userId 재시도는 덮어쓰기)한다. */
    void archive(WithdrawnUser data);

    /**
     * 이관 대상 스냅샷. 개인정보(name·ci·di·phoneNumber)는 평문으로 전달하고
     * 저장 시 암호화는 어댑터가 책임진다. password 해시는 보관 가치가 없어 이관하지 않는다.
     */
    record WithdrawnUser(
        Long userId,
        String loginId,
        String name,
        String ci,
        String ciHash,
        String di,
        String phoneNumber,
        boolean marketingConsent,
        LocalDateTime joinedAt,
        LocalDateTime withdrawnAt
    ) {

    }

}
