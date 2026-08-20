package com.allme.back.user.infrastructure.repository;

import com.allme.back.user.domain.Role;
import com.allme.back.user.domain.entity.UserRole;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRoleJpaRepository extends JpaRepository<UserRole, Long> {

    /** role 컬럼만 조회 — unique(user_id, role) 인덱스를 타는 최대 4행 조회 */
    @Query("select ur.role from UserRole ur where ur.user.id = :userId")
    Set<Role> findRolesByUserId(@Param("userId") Long userId);

}
