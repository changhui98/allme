package com.allme.back.listing.presentation.dto.response;

import com.allme.back.listing.application.service.ServiceListingService;
import com.allme.back.listing.domain.entity.ServiceListing;
import com.allme.back.request.domain.Region;
import java.time.LocalDateTime;
import java.util.List;

/** 공개 상세 — 게시 중(PUBLISHED) 서비스만. 서비스 상세 페이지 도입 대비 계약. */
public record OpenServiceListingDetailResponse(
    Long id,
    String category,
    String title,
    String summary,
    String description,
    List<String> regions,
    Long priceFrom,
    boolean priceNegotiable,
    String duration,
    String unitType,
    Integer unitValue,
    Long providerUserId,
    String providerName,
    LocalDateTime createdDate,
    List<MyServiceListingDetailResponse.ImageResponse> images
) {

    public static OpenServiceListingDetailResponse from(
        ServiceListing listing, String providerName, List<ServiceListingService.Image> images
    ) {
        return new OpenServiceListingDetailResponse(
            listing.getId(),
            listing.getCategory().name(),
            listing.getTitle(),
            listing.getSummary(),
            listing.getDescription(),
            listing.getRegions().stream().map(Region::name).toList(),
            listing.getPriceFrom(),
            listing.isPriceNegotiable(),
            listing.getDuration(),
            listing.getCategory().getUnitType().name(),
            listing.getUnitValue(),
            listing.getProviderUserId(),
            providerName,
            listing.getCreatedDate(),
            images.stream().map(MyServiceListingDetailResponse.ImageResponse::from).toList()
        );
    }

}
