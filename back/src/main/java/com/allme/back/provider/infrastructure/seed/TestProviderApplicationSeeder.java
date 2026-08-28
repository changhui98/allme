package com.allme.back.provider.infrastructure.seed;

import com.allme.back.provider.domain.entity.ProviderApplication;
import com.allme.back.provider.domain.repository.ProviderApplicationRepository;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 테스트 업체 계정(testprovider)의 승인 신청서 시더 — 개발 편의용. TestAccountSeeder(user 도메인)는 역할만 부여하므로
 * 업체명·소개가 비어 화면에 닉네임만 보인다. app.seed-test-accounts=true(SEED_TEST_ACCOUNTS)일 때만 기동 시 1회 실행,
 * 이미 승인 신청서가 있으면 스킵(멱등). 시드 순서: 계정(1) → 닉네임 백필(2) → 업체 신청서(3). 운영 환경에서는 절대 켜지 말 것.
 */
@Component
@Order(3)
@ConditionalOnProperty(name = "app.seed-test-accounts", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class TestProviderApplicationSeeder implements ApplicationRunner {

    private static final String PROVIDER_LOGIN_ID = "testprovider";
    private static final String ADMIN_LOGIN_ID = "testadmin";

    private final UserRepository userRepository;
    private final ProviderApplicationRepository applicationRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Optional<User> provider = userRepository.findByLoginId(PROVIDER_LOGIN_ID);
        if (provider.isEmpty()) {
            log.info("테스트 업체 신청서 스킵(계정 없음): {}", PROVIDER_LOGIN_ID);
            return;
        }
        Long providerUserId = provider.get().getId();
        if (applicationRepository.findLatestApprovedByUserId(providerUserId).isPresent()) {
            log.info("테스트 업체 신청서 스킵(이미 승인됨): {}", PROVIDER_LOGIN_ID);
            return;
        }

        Long processedBy = userRepository.findByLoginId(ADMIN_LOGIN_ID).map(User::getId).orElse(providerUserId);
        ProviderApplication application = ProviderApplication.create(
            providerUserId, "테스트 클린하우스", "1234567890",
            "입주·이사 청소 전문 테스트 업체입니다. 시드 데이터라 실제 업체가 아닙니다.", "01000000000");
        application.approve(processedBy);
        applicationRepository.save(application);
        log.info("테스트 업체 신청서 생성(승인): {} → 테스트 클린하우스", PROVIDER_LOGIN_ID);
    }

}
