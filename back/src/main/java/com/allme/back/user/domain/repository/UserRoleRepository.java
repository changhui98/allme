package com.allme.back.user.domain.repository;

import com.allme.back.user.domain.Role;
import java.util.Set;

/**
 * 역할 전용 경량 조회 — 인가 가드(RoleGuardInterceptor)용.
 * User 엔티티 전체를 로딩하면 암호화 컬럼(name·ci·di·phone) 복호화가 매 요청 발생하므로
 * role 컬럼만 뽑는 전용 쿼리를 둔다. 역할의 변경(부여/회수)은 User 애그리거트를 통해서만 한다.
 */
public interface UserRoleRepository {

    Set<Role> findRolesByUserId(Long userId);

}
