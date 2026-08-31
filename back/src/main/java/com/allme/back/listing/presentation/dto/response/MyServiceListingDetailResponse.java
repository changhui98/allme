package com.allme.back.listing.presentation.dto.response;

import com.allme.back.listing.application.service.ServiceListingService;
import com.allme.back.listing.domain.entity.ServiceListing;
import com.allme.back.request.domain.Region;
import java.time.LocalDateTime;
import java.util.List;

/** 내 서비스 상세 — 수정 폼 프리필용. unitType은 카테고리가 정한 단위. */
public record MyServiceListingDetailResponse(
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
    String status,
    LocalDateTime createdDate,
    LocalDateTime lastModifiedDate,
    List<ImageResponse> images
) {

    public record ImageResponse(Long fileId, String url) {

        public static ImageResponse from(ServiceListingService.Image image) {
            return new ImageResponse(image.fileId(), image.url());
        }

    }

    public static MyServiceListingDetailResponse from(
        ServiceListing listing, List<ServiceListingService.Image> images
    ) {
        return new MyServiceListingDetailResponse(
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
            listing.getStatus().name(),
            listing.getCreatedDate(),
            listing.getLastModifiedDate(),
            images.stream().map(ImageResponse::from).toList()
        );
    }

}
