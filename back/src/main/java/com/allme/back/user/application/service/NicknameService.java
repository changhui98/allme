package com.allme.back.user.application.service;

import com.allme.back.user.domain.NicknameGenerator;
import com.allme.back.user.domain.repository.UserRepository;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 유니크 닉네임 발급 — 가입(UserService.join)·시더·백필 러너가 공유한다.
 * 랜덤 생성 후 중복이면 재시도하고, 전부 충돌하는 극단 케이스는 숫자 suffix로 회수한다.
 * 검사~저장 사이 race는 users.nickname unique 제약이 최종 방어(loginId와 같은 철학).
 */
@Service
@RequiredArgsConstructor
public class NicknameService {

    private static final int MAX_ATTEMPTS = 5;

    private final NicknameGenerator nicknameGenerator;
    private final UserRepository userRepository;

    public String generateUnique() {
        String candidate = null;
        for (int i = 0; i < MAX_ATTEMPTS; i++) {
            candidate = nicknameGenerator.generate();
            if (!userRepository.existsByNickname(candidate)) {
                return candidate;
            }
        }
        // 64,000 조합이 5회 연속 충돌하는 경우 — 4자리 난수 suffix로 사실상 항상 회수된다
        String withSuffix = candidate + " " + ThreadLocalRandom.current().nextInt(1000, 10000);
        return userRepository.existsByNickname(withSuffix)
            ? candidate + " " + ThreadLocalRandom.current().nextInt(1000, 10000)
            : withSuffix;
    }

}
