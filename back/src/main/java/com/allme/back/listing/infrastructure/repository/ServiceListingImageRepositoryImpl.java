package com.allme.back.listing.infrastructure.repository;

import com.allme.back.listing.domain.entity.ServiceListingImage;
import com.allme.back.listing.domain.repository.ServiceListingImageRepository;
import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ServiceListingImageRepositoryImpl implements ServiceListingImageRepository {

    private final ServiceListingImageJpaRepository jpaRepository;

    @Override
    public List<ServiceListingImage> saveAll(List<ServiceListingImage> images) {
        return jpaRepository.saveAll(images);
    }

    @Override
    public List<ServiceListingImage> findAllByListingIdOrderBySortOrder(Long listingId) {
        return jpaRepository.findAllByListingIdOrderBySortOrderAsc(listingId);
    }

    @Override
    public List<ServiceListingImage> findAllByListingIdInOrderBySortOrder(Collection<Long> listingIds) {
        return listingIds.isEmpty() ? List.of() : jpaRepository.findAllByListingIdInOrderBySortOrderAsc(listingIds);
    }

    @Override
    public void deleteAllByListingId(Long listingId) {
        jpaRepository.deleteByListingId(listingId);
    }

}
