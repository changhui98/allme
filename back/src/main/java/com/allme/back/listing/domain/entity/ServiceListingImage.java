package com.allme.back.listing.domain.entity;

import com.allme.back.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 업체 서비스의 사진 — 서비스·파일 모두 JPA 연관 없이 id로만 참조한다
 * (open-in-view: false, file 도메인은 id 참조만 허용). 표시 순서는 sortOrder, 첫 장(0)이 대표(썸네일).
 */
@Entity
@Table(
    name = "service_listing_images",
    indexes = @Index(name = "idx_service_listing_images_listing_id", columnList = "listing_id")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ServiceListingImage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "listing_id", nullable = false)
    private Long listingId;

    /** upload_files.id */
    @Column(name = "file_id", nullable = false)
    private Long fileId;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    private ServiceListingImage(Long listingId, Long fileId, int sortOrder) {
        this.listingId = listingId;
        this.fileId = fileId;
        this.sortOrder = sortOrder;
    }

    public static ServiceListingImage create(Long listingId, Long fileId, int sortOrder) {
        return new ServiceListingImage(listingId, fileId, sortOrder);
    }

}
