package com.allme.back.listing.domain.entity;

import com.allme.back.global.entity.BaseEntity;
import com.allme.back.global.exception.AppException;
import com.allme.back.listing.domain.ServiceListingErrorCode;
import com.allme.back.listing.domain.ServiceListingStatus;
import com.allme.back.request.domain.Region;
import com.allme.back.request.domain.ServiceCategory;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.BatchSize;

/**
 * 업체 서비스("해드려요" 글) — PROVIDER 회원이 제공 서비스를 올려 공개 게시판에 노출한다.
 * - 카테고리·지역·작업 규모 enum은 request 도메인의 값 타입을 그대로 쓴다(proposal이 request를 참조하는 관례.
 *   공용 패키지로 승격은 별도 리팩터링으로).
 * - 지역은 복수 선택이라 애그리거트 소유 @ElementCollection(EAGER — open-in-view: false라 응답 조립에서 LAZY 불가,
 *   @BatchSize로 목록 조회 N+1 방지). 정합성(S003)은 정적 팩토리·update가 강제한다.
 * - 시작가(원)는 "견적 후 결정"(priceNegotiable)이면 null로 정규화한다(S002). 시세 적재 원칙대로
 *   가격 기준 규모(unitValue — 단위는 category.unitType)도 구조화해 둔다. 소요 기간은 표시용 자유 문자열.
 * - 사진은 ServiceListingImage가 id로만 참조한다. 삭제는 BaseEntity 소프트 삭제.
 */
@Entity
@Table(
    name = "service_listings",
    indexes = {
        @Index(name = "idx_service_listings_provider_user_id_id", columnList = "provider_user_id, id"),
        @Index(name = "idx_service_listings_status_category_id", columnList = "status, category, id")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ServiceListing extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_user_id", nullable = false)
    private Long providerUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ServiceCategory category;

    @Column(nullable = false, length = 100)
    private String title;

    /** 카드에 노출되는 한 줄 소개 */
    @Column(nullable = false, length = 150)
    private String summary;

    @Column(nullable = false, columnDefinition = "text")
    private String description;

    /** 서비스 지역 — 현장형은 서울 자치구 복수, 비현장형은 {ONLINE} 고정(S003) */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "service_listing_regions",
        joinColumns = @JoinColumn(name = "listing_id"),
        indexes = @Index(name = "idx_service_listing_regions_listing_id", columnList = "listing_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "region", nullable = false, length = 20)
    @BatchSize(size = 50)
    private Set<Region> regions = new LinkedHashSet<>();

    /** 시작가(원) — priceNegotiable이면 null */
    @Column(name = "price_from")
    private Long priceFrom;

    /** 견적 후 결정 여부 */
    @Column(name = "price_negotiable", nullable = false)
    private boolean priceNegotiable;

    /** 작업 소요 기간 표시용 자유 문자열(예: "3~4시간", "4~6주") — 선택 */
    @Column(length = 30)
    private String duration;

    /** 가격 기준 규모(평수·페이지 수) — 단위는 category.unitType. 선택 입력 */
    @Column(name = "unit_value")
    private Integer unitValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ServiceListingStatus status;

    private ServiceListing(
        Long providerUserId, ServiceCategory category, String title, String summary, String description,
        Set<Region> regions, Long priceFrom, boolean priceNegotiable, String duration, Integer unitValue
    ) {
        this.providerUserId = providerUserId;
        this.category = category;
        this.title = title;
        this.summary = summary;
        this.description = description;
        this.regions.addAll(regions);
        this.priceFrom = priceNegotiable ? null : priceFrom;
        this.priceNegotiable = priceNegotiable;
        this.duration = normalizeBlank(duration);
        this.unitValue = unitValue;
        this.status = ServiceListingStatus.PUBLISHED;
    }

    /**
     * 서비스 생성 — 정합성 규칙을 여기서 강제한다.
     * - 가격: 견적 후 결정이 아니면 시작가 1원 이상 필수, 견적 후 결정이면 null로 정규화 (S002)
     * - 지역: 현장형은 자치구 1개 이상(ONLINE 불가), 비현장형은 {ONLINE}만 (S003). 중복은 EnumSet으로 제거.
     */
    public static ServiceListing create(
        Long providerUserId, ServiceCategory category, String title, String summary, String description,
        Set<Region> regions, Long priceFrom, boolean priceNegotiable, String duration, Integer unitValue
    ) {
        Set<Region> normalizedRegions = validate(category, regions, priceFrom, priceNegotiable);
        return new ServiceListing(
            providerUserId, category, title, summary, description,
            normalizedRegions, priceFrom, priceNegotiable, duration, unitValue);
    }

    /** 수정 — 생성과 같은 규칙으로 재검증한다. 지역은 같은 컬렉션 인스턴스를 유지한 채 교체(orphan 관리). */
    public void update(
        ServiceCategory category, String title, String summary, String description,
        Set<Region> regions, Long priceFrom, boolean priceNegotiable, String duration, Integer unitValue
    ) {
        Set<Region> normalizedRegions = validate(category, regions, priceFrom, priceNegotiable);
        this.category = category;
        this.title = title;
        this.summary = summary;
        this.description = description;
        this.regions.clear();
        this.regions.addAll(normalizedRegions);
        this.priceFrom = priceNegotiable ? null : priceFrom;
        this.priceNegotiable = priceNegotiable;
        this.duration = normalizeBlank(duration);
        this.unitValue = unitValue;
    }

    public void publish() {
        this.status = ServiceListingStatus.PUBLISHED;
    }

    public void hide() {
        this.status = ServiceListingStatus.HIDDEN;
    }

    public boolean isPublished() {
        return this.status == ServiceListingStatus.PUBLISHED;
    }

    private static Set<Region> validate(
        ServiceCategory category, Set<Region> regions, Long priceFrom, boolean priceNegotiable
    ) {
        if (!priceNegotiable && (priceFrom == null || priceFrom <= 0)) {
            throw new AppException(ServiceListingErrorCode.INVALID_PRICE);
        }
        if (regions == null || regions.isEmpty()) {
            throw new AppException(ServiceListingErrorCode.INVALID_REGION);
        }
        Set<Region> normalized = EnumSet.copyOf(regions);
        boolean valid = category.isRequiresSite()
            ? !normalized.contains(Region.ONLINE)
            : normalized.equals(EnumSet.of(Region.ONLINE));
        if (!valid) {
            throw new AppException(ServiceListingErrorCode.INVALID_REGION);
        }
        return normalized;
    }

    private static String normalizeBlank(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

}
