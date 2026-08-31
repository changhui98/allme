package com.allme.back.listing.application.service;

import com.allme.back.request.domain.Region;
import com.allme.back.request.domain.ServiceCategory;
import java.util.List;

/**
 * 서비스 등록·수정 입력 — 필드가 많아 컨트롤러가 positional 인자 대신 이 record로 서비스에 넘긴다
 * (presentation → application 방향 의존이라 계층 규칙에 맞다). 검증 어노테이션은 presentation DTO 몫.
 */
public record ServiceListingCommand(
    ServiceCategory category,
    String title,
    String summary,
    String description,
    List<Region> regions,
    Long priceFrom,
    boolean priceNegotiable,
    String duration,
    Integer unitValue,
    /** 사진(표시 순서대로) — null이면 없음 */
    List<ImageRef> images
) {

    /**
     * 사진 참조 — 정확히 하나만 채운다.
     * fileId: 수정 시 유지할 기존 정식 파일(upload_files.id), tempFileId: 새로 올린 임시 파일(제출 시 승격).
     * 등록에서는 tempFileId만 허용된다(기존 파일이 없으므로).
     */
    public record ImageRef(Long fileId, Long tempFileId) { }

}
