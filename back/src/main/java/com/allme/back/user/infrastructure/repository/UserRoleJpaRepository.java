package com.allme.back.user.infrastructure.repository;

import com.allme.back.user.domain.Role;
import com.allme.back.user.domain.entity.UserRole;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRoleJpaRepository extends JpaRepository<UserRole, Long> {

    /** role 컬럼만 조회 — unique(user_id, role) 인덱스를 타는 최대 4행 조회 */
    @Query("select ur.role from UserRole ur where ur.user.id = :userId")
    Set<Role> findRolesByUserId(@Param("userId") Long userId);

    /** 관리자 목록용 — 페이지 회원들의 역할을 쿼리 1개로 배치 조회 */
    @Query("select ur.user.id, ur.role from UserRole ur where ur.user.id in :userIds")
    List<Object[]> findUserIdAndRoleByUserIdIn(@Param("userIds") Collection<Long> userIds);

    long countByRole(Role role);

}
