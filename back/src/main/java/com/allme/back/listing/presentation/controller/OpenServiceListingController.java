package com.allme.back.listing.presentation.controller;

import com.allme.back.global.dto.PageResponse;
import com.allme.back.listing.application.service.ServiceListingService;
import com.allme.back.listing.domain.entity.ServiceListing;
import com.allme.back.listing.presentation.dto.response.OpenServiceListingDetailResponse;
import com.allme.back.listing.presentation.dto.response.OpenServiceListingSummaryResponse;
import com.allme.back.provider.application.service.ProviderService;
import com.allme.back.provider.domain.entity.ProviderApplication;
import com.allme.back.request.domain.ServiceCategory;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * "해드려요" 공개 게시판 — 비로그인 포함 누구나 조회(@RequireRole 없음).
 * 업체 API(/api/provider-services, 클래스 레벨 PROVIDER)와 경로가 겹치지 않도록 /open 프리픽스를 쓴다.
 * 업체 표시명은 최신 승인 신청서의 업체명 → 없으면 닉네임(수동 역할 부여 회원) 순으로,
 * provider 도메인 역의존을 피해 프레젠테이션 계층에서 배치 조합한다(PublicProviderController 방식).
 */
@RestController
@RequestMapping("/api/provider-services/open")
@RequiredArgsConstructor
public class OpenServiceListingController {

    private final ServiceListingService listingService;
    private final ProviderService providerService;

    /** 게시 중 서비스 목록 — category 미지정 시 전체, q는 제목·한 줄 소개 부분 일치, 최신순 */
    @GetMapping
    public PageResponse<OpenServiceListingSummaryResponse> list(
        @RequestParam(required = false) ServiceCategory category,
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Page<ServiceListing> listings = listingService.getPublishedPage(category, q, page, size);
        return PageResponse.from(assemble(listings.getContent()).paginate(listings));
    }

    /** 공개 상세 — 숨김·삭제·부재는 404(S001) */
    @GetMapping("/{id}")
    public OpenServiceListingDetailResponse detail(@PathVariable Long id) {
        ServiceListing listing = listingService.getPublished(id);
        String providerName = providerNamesOf(List.of(listing)).get(listing.getProviderUserId());
        return OpenServiceListingDetailResponse.from(
            listing, providerName, listingService.imagesOf(listing.getId()));
    }

    /** 업체 공개 페이지의 제공 서비스 — 게시 중만, 최신순(상한 50) */
    @GetMapping("/providers/{userId}")
    public List<OpenServiceListingSummaryResponse> byProvider(@PathVariable Long userId) {
        List<ServiceListing> listings = listingService.getPublishedByProvider(userId);
        return assemble(listings).rows();
    }

    /** 목록 응답 조립 — 업체명·썸네일을 각각 한 번의 배치 조회로 채운다. */
    private Assembled assemble(List<ServiceListing> listings) {
        Map<Long, String> providerNames = providerNamesOf(listings);
        Set<Long> listingIds = new LinkedHashSet<>();
        for (ServiceListing listing : listings) {
            listingIds.add(listing.getId());
        }
        Map<Long, String> thumbnails = listingService.thumbnailsOf(listingIds);
        return new Assembled(listings, providerNames, thumbnails);
    }

    /** 업체 표시명 배치 조회 — 최신 승인 신청서의 업체명, 없으면 닉네임. */
    private Map<Long, String> providerNamesOf(Collection<ServiceListing> listings) {
        Set<Long> userIds = new LinkedHashSet<>();
        for (ServiceListing listing : listings) {
            userIds.add(listing.getProviderUserId());
        }
        Map<Long, ProviderApplication> applications = providerService.latestApprovedByUserIds(userIds);
        Map<Long, String> nicknames = listingService.nicknamesOf(userIds);

        Map<Long, String> names = new java.util.HashMap<>();
        for (Long userId : userIds) {
            ProviderApplication application = applications.get(userId);
            names.put(userId, application != null ? application.getBusinessName() : nicknames.get(userId));
        }
        return names;
    }

    private record Assembled(
        List<ServiceListing> listings, Map<Long, String> providerNames, Map<Long, String> thumbnails
    ) {

        Page<OpenServiceListingSummaryResponse> paginate(Page<ServiceListing> page) {
            return page.map(this::rowOf);
        }

        List<OpenServiceListingSummaryResponse> rows() {
            return listings.stream().map(this::rowOf).toList();
        }

        private OpenServiceListingSummaryResponse rowOf(ServiceListing listing) {
            return OpenServiceListingSummaryResponse.from(
                listing,
                providerNames.get(listing.getProviderUserId()),
                thumbnails.get(listing.getId()));
        }

    }

}
