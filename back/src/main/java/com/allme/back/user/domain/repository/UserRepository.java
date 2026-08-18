package com.allme.back.user.domain.repository;

import com.allme.back.user.domain.entity.User;
import java.util.Optional;

public interface UserRepository {

    boolean existsByLoginId(String loginId);

    boolean existsByCiHash(String ciHash);

    Optional<User> findById(Long id);

    Optional<User> findByLoginId(String loginId);

    User save(User user);

}
