package com.allme.back.user.infrastructure.repository;

import com.allme.back.user.domain.AdminUserRow;
import com.allme.back.user.domain.Role;
import com.allme.back.user.domain.repository.UserAdminQueryRepository;
import java.util.Collection;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserAdminQueryRepositoryImpl implements UserAdminQueryRepository {

    private final UserJpaRepository userJpaRepository;
    private final UserRoleJpaRepository userRoleJpaRepository;

    @Override
    public Map<Long, String> findLoginIdsByUserIds(Collection<Long> userIds) {
        if (userIds.isEmpty()) {
            return Map.of(); // JPQL in () 문법 오류 방지
        }
        return userJpaRepository.findIdAndLoginIdByIdIn(userIds).stream()
            .collect(Collectors.toMap(row -> (Long) row[0], row -> (String) row[1]));
    }

    @Override
    public Page<AdminUserRow> search(String loginIdKeywordOrNull, Pageable pageable) {
        if (loginIdKeywordOrNull == null) {
            return userJpaRepository.findAllAdminRows(pageable); // null을 like에 바인딩하지 않는다
        }
        return userJpaRepository.searchAdminRowsByLoginId(loginIdKeywordOrNull, pageable);
    }

    @Override
    public Map<Long, Set<Role>> findRolesByUserIds(Collection<Long> userIds) {
        if (userIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, Set<Role>> roles = new HashMap<>();
        for (Object[] row : userRoleJpaRepository.findUserIdAndRoleByUserIdIn(userIds)) {
            roles.computeIfAbsent((Long) row[0], id -> EnumSet.noneOf(Role.class))
                .add((Role) row[1]);
        }
        return roles;
    }

    @Override
    public long countActive() {
        return userJpaRepository.countByDeletedDateIsNull();
    }

    @Override
    public long countByRole(Role role) {
        return userRoleJpaRepository.countByRole(role);
    }

}
