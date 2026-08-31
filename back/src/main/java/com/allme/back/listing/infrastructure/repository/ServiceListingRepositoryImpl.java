package com.allme.back.listing.infrastructure.repository;

import com.allme.back.listing.domain.ServiceListingStatus;
import com.allme.back.listing.domain.entity.ServiceListing;
import com.allme.back.listing.domain.repository.ServiceListingRepository;
import com.allme.back.request.domain.ServiceCategory;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

/** 소프트 삭제(BaseEntity.deletedDate) 행은 모든 조회에서 제외한다(@SQLRestriction 미사용 관례). */
@Repository
@RequiredArgsConstructor
public class ServiceListingRepositoryImpl implements ServiceListingRepository {

    private final ServiceListingJpaRepository jpaRepository;

    @Override
    public ServiceListing save(ServiceListing listing) {
        return jpaRepository.save(listing);
    }

    @Override
    public Optional<ServiceListing> findByIdAndProviderUserId(Long id, Long providerUserId) {
        return jpaRepository.findByIdAndProviderUserIdAndDeletedDateIsNull(id, providerUserId);
    }

    @Override
    public Page<ServiceListing> findPageByProviderUserId(Long providerUserId, Pageable pageable) {
        return jpaRepository.findByProviderUserIdAndDeletedDateIsNull(providerUserId, pageable);
    }

    /** 카테고리·키워드 유무를 분기해 메서드를 나눈다(조건을 한 쿼리로 합치지 않는 프로젝트 관례) */
    @Override
    public Page<ServiceListing> findPublishedPage(
        ServiceCategory categoryOrNull, String keywordOrNull, Pageable pageable
    ) {
        if (keywordOrNull == null) {
            return categoryOrNull == null
                ? jpaRepository.findByStatusAndDeletedDateIsNull(ServiceListingStatus.PUBLISHED, pageable)
                : jpaRepository.findByStatusAndCategoryAndDeletedDateIsNull(
                    ServiceListingStatus.PUBLISHED, categoryOrNull, pageable);
        }
        return categoryOrNull == null
            ? jpaRepository.searchPublished(keywordOrNull, pageable)
            : jpaRepository.searchPublishedByCategory(categoryOrNull, keywordOrNull, pageable);
    }

    @Override
    public Optional<ServiceListing> findPublishedById(Long id) {
        return jpaRepository.findByIdAndStatusAndDeletedDateIsNull(id, ServiceListingStatus.PUBLISHED);
    }

    @Override
    public Page<ServiceListing> findPublishedPageByProviderUserId(Long providerUserId, Pageable pageable) {
        return jpaRepository.findByStatusAndProviderUserIdAndDeletedDateIsNull(
            ServiceListingStatus.PUBLISHED, providerUserId, pageable);
    }

}
