package com.allme.back.user.infrastructure.repository;

import com.allme.back.user.domain.repository.UserAdminQueryRepository;
import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserAdminQueryRepositoryImpl implements UserAdminQueryRepository {

    private final UserJpaRepository userJpaRepository;

    @Override
    public Map<Long, String> findLoginIdsByUserIds(Collection<Long> userIds) {
        if (userIds.isEmpty()) {
            return Map.of(); // JPQL in () 문법 오류 방지
        }
        return userJpaRepository.findIdAndLoginIdByIdIn(userIds).stream()
            .collect(Collectors.toMap(row -> (Long) row[0], row -> (String) row[1]));
    }

}
