package com.allme.back.listing.domain.entity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.allme.back.global.exception.AppException;
import com.allme.back.listing.domain.ServiceListingErrorCode;
import com.allme.back.listing.domain.ServiceListingStatus;
import com.allme.back.request.domain.Region;
import com.allme.back.request.domain.ServiceCategory;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ServiceListingTest {

    @Test
    @DisplayName("현장형 서비스는 자치구 복수 지역·시작가로 PUBLISHED 상태로 생성된다")
    void create_siteCategory() {
        ServiceListing listing = ServiceListing.create(
            1L, ServiceCategory.CLEANING, "입주청소", "한 줄 소개", "상세 설명",
            Set.of(Region.GANGNAM, Region.SEOCHO), 150_000L, false, "  3~4시간 ", 10);

        assertThat(listing.getStatus()).isEqualTo(ServiceListingStatus.PUBLISHED);
        assertThat(listing.getRegions()).containsExactlyInAnyOrder(Region.GANGNAM, Region.SEOCHO);
        assertThat(listing.getPriceFrom()).isEqualTo(150_000L);
        assertThat(listing.getDuration()).isEqualTo("3~4시간");
        assertThat(listing.getUnitValue()).isEqualTo(10);
    }

    @Test
    @DisplayName("견적 후 결정이면 시작가는 null로 정규화되고, 비현장형은 ONLINE만 허용된다")
    void create_negotiable_online() {
        ServiceListing listing = ServiceListing.create(
            1L, ServiceCategory.WEB_DESIGN, "홈페이지 제작", "한 줄", "설명",
            Set.of(Region.ONLINE), 999L, true, null, null);

        assertThat(listing.getPriceFrom()).isNull();
        assertThat(listing.isPriceNegotiable()).isTrue();
        assertThat(listing.getRegions()).containsExactly(Region.ONLINE);
        assertThat(listing.getDuration()).isNull();
    }

    @Test
    @DisplayName("견적 후 결정이 아닌데 시작가가 없거나 0 이하면 S002")
    void create_invalidPrice() {
        assertPriceInvalid(null);
        assertPriceInvalid(0L);
        assertPriceInvalid(-1L);
    }

    private static void assertPriceInvalid(Long priceFrom) {
        assertThatThrownBy(() -> ServiceListing.create(
            1L, ServiceCategory.CLEANING, "제목", "한 줄", "설명",
            Set.of(Region.GANGNAM), priceFrom, false, null, null))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceListingErrorCode.INVALID_PRICE);
    }

    @Test
    @DisplayName("지역이 비었거나, 현장형에 ONLINE이 섞이거나, 비현장형에 자치구가 있으면 S003")
    void create_invalidRegion() {
        assertRegionInvalid(ServiceCategory.CLEANING, Set.of());
        assertRegionInvalid(ServiceCategory.CLEANING, Set.of(Region.GANGNAM, Region.ONLINE));
        assertRegionInvalid(ServiceCategory.WEB_DESIGN, Set.of(Region.GANGNAM));
        assertRegionInvalid(ServiceCategory.WEB_DESIGN, Set.of(Region.ONLINE, Region.MAPO));
    }

    private static void assertRegionInvalid(ServiceCategory category, Set<Region> regions) {
        assertThatThrownBy(() -> ServiceListing.create(
            1L, category, "제목", "한 줄", "설명", regions, 100_000L, false, null, null))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceListingErrorCode.INVALID_REGION);
    }

    @Test
    @DisplayName("수정도 같은 규칙으로 재검증하며 지역·가격을 교체한다")
    void update_revalidates() {
        ServiceListing listing = ServiceListing.create(
            1L, ServiceCategory.CLEANING, "제목", "한 줄", "설명",
            Set.of(Region.GANGNAM), 100_000L, false, "2시간", 10);

        listing.update(
            ServiceCategory.WEB_DESIGN, "새 제목", "새 한 줄", "새 설명",
            Set.of(Region.ONLINE), null, true, null, 5);

        assertThat(listing.getCategory()).isEqualTo(ServiceCategory.WEB_DESIGN);
        assertThat(listing.getRegions()).containsExactly(Region.ONLINE);
        assertThat(listing.getPriceFrom()).isNull();
        assertThat(listing.isPriceNegotiable()).isTrue();

        assertThatThrownBy(() -> listing.update(
            ServiceCategory.CLEANING, "제목", "한 줄", "설명",
            Set.of(Region.ONLINE), 100_000L, false, null, null))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ServiceListingErrorCode.INVALID_REGION);
    }

    @Test
    @DisplayName("숨김·공개 전환이 상태를 바꾼다")
    void hideAndPublish() {
        ServiceListing listing = ServiceListing.create(
            1L, ServiceCategory.CLEANING, "제목", "한 줄", "설명",
            Set.of(Region.GANGNAM), 100_000L, false, null, null);

        listing.hide();
        assertThat(listing.getStatus()).isEqualTo(ServiceListingStatus.HIDDEN);
        assertThat(listing.isPublished()).isFalse();

        listing.publish();
        assertThat(listing.isPublished()).isTrue();
    }

}
