package com.allme.back.listing.infrastructure.repository;

import com.allme.back.listing.domain.entity.ServiceListingImage;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceListingImageJpaRepository extends JpaRepository<ServiceListingImage, Long> {

    List<ServiceListingImage> findAllByListingIdOrderBySortOrderAsc(Long listingId);

    List<ServiceListingImage> findAllByListingIdInOrderBySortOrderAsc(Collection<Long> listingIds);

    void deleteByListingId(Long listingId);

}
