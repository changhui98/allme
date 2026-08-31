package com.allme.back.listing.presentation.dto.response;

import com.allme.back.listing.domain.entity.ServiceListing;
import com.allme.back.request.domain.Region;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 공개 목록 행("해드려요" 카드) — 상세 설명은 내리지 않는다.
 * providerName은 최신 승인 신청서의 업체명(없으면 닉네임 — 수동 역할 부여 회원), 그마저 없으면 null.
 * 평점·리뷰 수는 리뷰 도메인 구현 전이라 계약에 없다.
 */
public record OpenServiceListingSummaryResponse(
    Long id,
    String category,
    String title,
    String summary,
    List<String> regions,
    Long priceFrom,
    boolean priceNegotiable,
    String duration,
    Long providerUserId,
    String providerName,
    String thumbnailUrl,
    LocalDateTime createdDate
) {

    public static OpenServiceListingSummaryResponse from(
        ServiceListing listing, String providerName, String thumbnailUrl
    ) {
        return new OpenServiceListingSummaryResponse(
            listing.getId(),
            listing.getCategory().name(),
            listing.getTitle(),
            listing.getSummary(),
            listing.getRegions().stream().map(Region::name).toList(),
            listing.getPriceFrom(),
            listing.isPriceNegotiable(),
            listing.getDuration(),
            listing.getProviderUserId(),
            providerName,
            thumbnailUrl,
            listing.getCreatedDate()
        );
    }

}
