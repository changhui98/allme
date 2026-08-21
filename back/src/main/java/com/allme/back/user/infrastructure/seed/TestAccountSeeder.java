package com.allme.back.user.infrastructure.seed;

import com.allme.back.user.application.service.NicknameService;
import com.allme.back.user.domain.Role;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 역할별 테스트 계정 시더 — 개발 편의용. app.seed-test-accounts=true(SEED_TEST_ACCOUNTS)일 때만 기동 시 1회 실행.
 * 정상 가입은 포트원 본인인증이 필수라 테스트 계정을 API로 만들 수 없고,
 * name이 AES-GCM 암호화 컬럼이라 SQL 직접 INSERT도 불가 — JPA 엔티티 경로로 생성해야 컨버터가 적용된다.
 * loginId 존재 시 스킵(멱등). ci·ciHash는 null(본인인증 미경유 — unique는 null 중복 허용).
 * 비밀번호는 전부 Test1234! — 운영 환경에서는 절대 켜지 말 것.
 */
@Component
@Order(1) // NicknameBackfillRunner(@Order(2))보다 먼저 — 시더 계정도 자체적으로 닉네임을 받는다
@ConditionalOnProperty(name = "app.seed-test-accounts", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class TestAccountSeeder implements ApplicationRunner {

    private static final String TEST_PASSWORD = "Test1234!";

    private record TestAccount(String loginId, String name, List<Role> roles) { }

    /** 모든 계정에 USER 기본 포함 — 정상 가입 흐름과 동일한 상태를 만든다 */
    private static final List<TestAccount> TEST_ACCOUNTS = List.of(
        new TestAccount("testuser", "테스트사용자", List.of(Role.USER)),
        new TestAccount("testprovider", "테스트업체", List.of(Role.USER, Role.PROVIDER)),
        new TestAccount("testmanager", "테스트매니저", List.of(Role.USER, Role.MANAGER)),
        new TestAccount("testadmin", "테스트관리자", List.of(Role.USER, Role.ADMIN))
    );

    private final UserRepository userRepository;
    private final NicknameService nicknameService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String encodedPassword = passwordEncoder.encode(TEST_PASSWORD);

        for (TestAccount account : TEST_ACCOUNTS) {
            if (userRepository.existsByLoginId(account.loginId())) {
                log.info("테스트 계정 스킵(이미 존재): {}", account.loginId());
                continue;
            }
            User user = User.create(
                account.loginId(), encodedPassword, account.name(),
                nicknameService.generateUnique(),
                null, null, null, null, false
            );
            account.roles().forEach(user::grantRole);
            userRepository.save(user);
            log.info("테스트 계정 생성: {} (역할: {})", account.loginId(), account.roles());
        }
    }

}
