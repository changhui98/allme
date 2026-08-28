package com.allme.back.user.domain.repository;

import java.util.Collection;
import java.util.Map;

/**
 * 대외 표시용 경량 조회 — 게시판·제안 등에서 작성자 닉네임을 배치로 뽑는다.
 * User 엔티티를 로딩하면 암호화 컬럼 복호화가 행마다 발생하므로 평문 컬럼(nickname)만 프로젝션한다
 * (UserAdminQueryRepository와 같은 근거 — 그쪽은 관리자 화면 전용이라 여기로 분리).
 */
public interface UserDisplayQueryRepository {

    /** 표시용 닉네임 배치 조회 — 탈퇴 회원은 닉네임이 null이라 맵에서 빠진다. */
    Map<Long, String> findNicknamesByUserIds(Collection<Long> userIds);

}
