package com.allme.back.listing.domain.repository;

import com.allme.back.listing.domain.entity.ServiceListing;
import com.allme.back.request.domain.ServiceCategory;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ServiceListingRepository {

    ServiceListing save(ServiceListing listing);

    /** 소유자 본인 확인을 겸한 조회 — 타인 서비스는 empty */
    Optional<ServiceListing> findByIdAndProviderUserId(Long id, Long providerUserId);

    Page<ServiceListing> findPageByProviderUserId(Long providerUserId, Pageable pageable);

    /** 공개 목록 — 게시 중(PUBLISHED)만. 카테고리 null이면 전체, 키워드 null이면 검색 없음(제목·한 줄 소개 부분 일치). */
    Page<ServiceListing> findPublishedPage(ServiceCategory categoryOrNull, String keywordOrNull, Pageable pageable);

    /** 공개 상세 — 숨김·삭제는 empty */
    Optional<ServiceListing> findPublishedById(Long id);

    /** 업체 공개 페이지의 제공 서비스 목록 — 게시 중만 */
    Page<ServiceListing> findPublishedPageByProviderUserId(Long providerUserId, Pageable pageable);

}
