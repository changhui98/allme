package com.allme.back.user.domain.repository;

import java.util.Collection;
import java.util.Map;

/**
 * 관리자 화면 전용 경량 조회 — User 엔티티를 로딩하면 암호화 컬럼(name·ci·di·phone)
 * 복호화가 행마다 발생하므로, 관리자 목록/표시는 평문 컬럼만 뽑는 프로젝션 쿼리를 쓴다
 * (UserRoleRepository와 같은 근거). 쓰기는 여기서 하지 않는다.
 */
public interface UserAdminQueryRepository {

    /** 표시용 loginId 배치 조회 — 목록 행당 쿼리를 만들지 않기 위한 in 절 조회. */
    Map<Long, String> findLoginIdsByUserIds(Collection<Long> userIds);

}
