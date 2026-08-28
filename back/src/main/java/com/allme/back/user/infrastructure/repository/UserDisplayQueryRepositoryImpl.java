package com.allme.back.user.infrastructure.repository;

import com.allme.back.user.domain.repository.UserDisplayQueryRepository;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserDisplayQueryRepositoryImpl implements UserDisplayQueryRepository {

    private final UserJpaRepository userJpaRepository;

    @Override
    public Map<Long, String> findNicknamesByUserIds(Collection<Long> userIds) {
        if (userIds.isEmpty()) {
            return Map.of(); // JPQL in () 문법 오류 방지
        }
        Map<Long, String> nicknames = new HashMap<>();
        for (Object[] row : userJpaRepository.findIdAndNicknameByIdIn(userIds)) {
            if (row[1] != null) {
                nicknames.put((Long) row[0], (String) row[1]);
            }
        }
        return nicknames;
    }

}
