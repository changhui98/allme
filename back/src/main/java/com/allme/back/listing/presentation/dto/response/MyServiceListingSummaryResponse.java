package com.allme.back.listing.presentation.dto.response;

import com.allme.back.listing.domain.entity.ServiceListing;
import com.allme.back.request.domain.Region;
import java.time.LocalDateTime;
import java.util.List;

/** 내 서비스 목록 행 — 상세 설명은 내리지 않는다. thumbnailUrl은 첫 사진(없으면 null). */
public record MyServiceListingSummaryResponse(
    Long id,
    String category,
    String title,
    String summary,
    List<String> regions,
    Long priceFrom,
    boolean priceNegotiable,
    String duration,
    String status,
    String thumbnailUrl,
    LocalDateTime createdDate
) {

    public static MyServiceListingSummaryResponse from(ServiceListing listing, String thumbnailUrl) {
        return new MyServiceListingSummaryResponse(
            listing.getId(),
            listing.getCategory().name(),
            listing.getTitle(),
            listing.getSummary(),
            listing.getRegions().stream().map(Region::name).toList(),
            listing.getPriceFrom(),
            listing.isPriceNegotiable(),
            listing.getDuration(),
            listing.getStatus().name(),
            thumbnailUrl,
            listing.getCreatedDate()
        );
    }

}
