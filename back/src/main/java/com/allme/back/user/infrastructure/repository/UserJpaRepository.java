package com.allme.back.user.infrastructure.repository;

import com.allme.back.user.domain.entity.User;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserJpaRepository extends JpaRepository<User, Long> {

    boolean existsByLoginId(String loginId);

    boolean existsByCiHash(String ciHash);

    Optional<User> findByLoginId(String loginId);

    /** 관리자 표시용 — 평문 컬럼(id·loginId)만 조회해 암호화 컬럼 복호화를 피한다 */
    @Query("select u.id, u.loginId from User u where u.id in :userIds")
    List<Object[]> findIdAndLoginIdByIdIn(@Param("userIds") Collection<Long> userIds);

}
