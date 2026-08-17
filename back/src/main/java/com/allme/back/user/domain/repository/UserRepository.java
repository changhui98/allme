package com.allme.back.user.domain.repository;

import com.allme.back.user.domain.entity.User;

public interface UserRepository {

    boolean existsByLoginId(String loginId);

    boolean existsByCiHash(String ciHash);

    User save(User user);

}
