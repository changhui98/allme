package com.allme.back.listing.infrastructure.seed;

import com.allme.back.listing.domain.entity.ServiceListing;
import com.allme.back.listing.domain.repository.ServiceListingRepository;
import com.allme.back.request.domain.Region;
import com.allme.back.request.domain.ServiceCategory;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserRepository;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 테스트 업체 계정(testprovider)의 서비스 시더 — 개발 편의용. 해드려요 게시판·내 서비스 화면 확인을 위해
 * 게시 중 서비스 2건(청소·웹 제작)을 만든다. app.seed-test-accounts=true(SEED_TEST_ACCOUNTS)일 때만
 * 기동 시 1회 실행, 이미 서비스가 있으면 스킵(멱등). 시드 순서: 계정(1) → 닉네임 백필(2) → 업체 신청서(3) → 서비스(4).
 * 운영 환경에서는 절대 켜지 말 것.
 */
@Component
@Order(4)
@ConditionalOnProperty(name = "app.seed-test-accounts", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class TestServiceListingSeeder implements ApplicationRunner {

    private static final String PROVIDER_LOGIN_ID = "testprovider";

    private final UserRepository userRepository;
    private final ServiceListingRepository listingRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Optional<User> provider = userRepository.findByLoginId(PROVIDER_LOGIN_ID);
        if (provider.isEmpty()) {
            log.info("테스트 서비스 스킵(계정 없음): {}", PROVIDER_LOGIN_ID);
            return;
        }
        Long providerUserId = provider.get().getId();
        if (listingRepository.findPageByProviderUserId(providerUserId, PageRequest.of(0, 1)).hasContent()) {
            log.info("테스트 서비스 스킵(이미 존재): {}", PROVIDER_LOGIN_ID);
            return;
        }

        listingRepository.save(ServiceListing.create(
            providerUserId, ServiceCategory.CLEANING,
            "원룸·오피스텔 입주청소 전문",
            "구석구석 새집처럼 — 입주 전 완벽한 청소를 약속해요.",
            "입주·이사 청소 전문 테스트 업체의 시드 서비스입니다. 창틀·베란다·주방 기름때까지 기본 범위에 포함되며, "
                + "10평 기준 시작가이고 평수·오염도에 따라 견적이 달라질 수 있어요.",
            Set.of(Region.GANGNAM, Region.SEOCHO),
            150_000L, false, "3~4시간", 10));

        listingRepository.save(ServiceListing.create(
            providerUserId, ServiceCategory.WEB_DESIGN,
            "반응형 홈페이지 제작",
            "기획부터 배포까지 — 소상공인 맞춤 반응형 홈페이지를 만들어 드려요.",
            "웹 제작 테스트 시드 서비스입니다. 페이지 구성·디자인 시안 협의 후 견적을 드리며, "
                + "유지보수 옵션도 협의할 수 있어요.",
            Set.of(Region.ONLINE),
            null, true, "4~6주", null));

        log.info("테스트 서비스 생성: {} → 2건(청소·웹 제작)", PROVIDER_LOGIN_ID);
    }

}
