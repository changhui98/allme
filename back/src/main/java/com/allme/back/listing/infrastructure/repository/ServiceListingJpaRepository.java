package com.allme.back.listing.infrastructure.repository;

import com.allme.back.listing.domain.ServiceListingStatus;
import com.allme.back.listing.domain.entity.ServiceListing;
import com.allme.back.request.domain.ServiceCategory;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ServiceListingJpaRepository extends JpaRepository<ServiceListing, Long> {

    Optional<ServiceListing> findByIdAndProviderUserIdAndDeletedDateIsNull(Long id, Long providerUserId);

    Page<ServiceListing> findByProviderUserIdAndDeletedDateIsNull(Long providerUserId, Pageable pageable);

    Optional<ServiceListing> findByIdAndStatusAndDeletedDateIsNull(Long id, ServiceListingStatus status);

    Page<ServiceListing> findByStatusAndProviderUserIdAndDeletedDateIsNull(
        ServiceListingStatus status, Long providerUserId, Pageable pageable);

    Page<ServiceListing> findByStatusAndDeletedDateIsNull(ServiceListingStatus status, Pageable pageable);

    Page<ServiceListing> findByStatusAndCategoryAndDeletedDateIsNull(
        ServiceListingStatus status, ServiceCategory category, Pageable pageable);

    /*
     * 키워드 검색 — 제목·한 줄 소개 부분 일치(대소문자 무시).
     * LIKE에 null을 바인딩하면 PostgreSQL이 bytea로 추론해 실패하므로(공지·회원 검색 이력),
     * 키워드 유무·카테고리 유무를 호출부(RepositoryImpl)에서 분기해 메서드를 나눈다.
     */
    @Query(
        value = """
            select l from ServiceListing l
            where l.status = com.allme.back.listing.domain.ServiceListingStatus.PUBLISHED
              and l.deletedDate is null
              and (lower(l.title) like lower(concat('%', :keyword, '%'))
                or lower(l.summary) like lower(concat('%', :keyword, '%')))
            """,
        countQuery = """
            select count(l) from ServiceListing l
            where l.status = com.allme.back.listing.domain.ServiceListingStatus.PUBLISHED
              and l.deletedDate is null
              and (lower(l.title) like lower(concat('%', :keyword, '%'))
                or lower(l.summary) like lower(concat('%', :keyword, '%')))
            """
    )
    Page<ServiceListing> searchPublished(@Param("keyword") String keyword, Pageable pageable);

    @Query(
        value = """
            select l from ServiceListing l
            where l.status = com.allme.back.listing.domain.ServiceListingStatus.PUBLISHED
              and l.deletedDate is null
              and l.category = :category
              and (lower(l.title) like lower(concat('%', :keyword, '%'))
                or lower(l.summary) like lower(concat('%', :keyword, '%')))
            """,
        countQuery = """
            select count(l) from ServiceListing l
            where l.status = com.allme.back.listing.domain.ServiceListingStatus.PUBLISHED
              and l.deletedDate is null
              and l.category = :category
              and (lower(l.title) like lower(concat('%', :keyword, '%'))
                or lower(l.summary) like lower(concat('%', :keyword, '%')))
            """
    )
    Page<ServiceListing> searchPublishedByCategory(
        @Param("category") ServiceCategory category, @Param("keyword") String keyword, Pageable pageable);

}
