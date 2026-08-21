package com.allme.back.user.infrastructure.seed;

import com.allme.back.user.application.service.NicknameService;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 닉네임 백필 — 닉네임 도입 전 가입한 활성 회원에게 랜덤 닉네임을 채운다.
 * 멱등(대상 없으면 no-op)이고 수십 행 규모라 조건부 플래그 없이 항상 실행한다.
 * 시더(@Order(1))가 만든 테스트 계정 뒤에 돌도록 @Order(2).
 */
@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class NicknameBackfillRunner implements ApplicationRunner {

    private final UserRepository userRepository;
    private final NicknameService nicknameService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<User> targets = userRepository.findAllWithoutNickname();
        if (targets.isEmpty()) {
            return;
        }
        for (User user : targets) {
            user.changeNickname(nicknameService.generateUnique());
        }
        log.info("닉네임 백필 완료: {}명", targets.size());
    }

}
