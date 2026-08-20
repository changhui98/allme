package com.allme.back.user.infrastructure.repository;

import com.allme.back.user.domain.Role;
import com.allme.back.user.domain.repository.UserRoleRepository;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserRoleRepositoryImpl implements UserRoleRepository {

    private final UserRoleJpaRepository userRoleJpaRepository;

    @Override
    public Set<Role> findRolesByUserId(Long userId) {
        return userRoleJpaRepository.findRolesByUserId(userId);
    }

}
