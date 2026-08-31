package com.allme.back.listing.domain.repository;

import com.allme.back.listing.domain.entity.ServiceListingImage;
import java.util.Collection;
import java.util.List;

public interface ServiceListingImageRepository {

    List<ServiceListingImage> saveAll(List<ServiceListingImage> images);

    List<ServiceListingImage> findAllByListingIdOrderBySortOrder(Long listingId);

    /** 목록 썸네일 조립용 배치 조회(행당 쿼리 금지) */
    List<ServiceListingImage> findAllByListingIdInOrderBySortOrder(Collection<Long> listingIds);

    /** 수정 시 전체 교체용 — 호출부 트랜잭션 안에서 실행 */
    void deleteAllByListingId(Long listingId);

}
