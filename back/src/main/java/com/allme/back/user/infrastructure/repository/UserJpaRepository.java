package com.allme.back.user.infrastructure.repository;

import com.allme.back.user.domain.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserJpaRepository extends JpaRepository<User, Long> {

    boolean existsByLoginId(String loginId);

    boolean existsByCiHash(String ciHash);

    Optional<User> findByLoginId(String loginId);

}
