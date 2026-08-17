package com.allme.back.user.infrastructure.repository;

import com.allme.back.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserJpaRepository extends JpaRepository<User, Long> {

    boolean existsByLoginId(String loginId);

    boolean existsByCiHash(String ciHash);

}
