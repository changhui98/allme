package com.allme.back.request.domain.repository;

import com.allme.back.request.domain.ServiceCategory;
import com.allme.back.request.domain.entity.ServiceRequest;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ServiceRequestRepository {

    ServiceRequest save(ServiceRequest request);

    /** 소유자 무관 조회(삭제 제외) — 공개 상세·업체 제안용 */
    Optional<ServiceRequest> findById(Long id);

    /** 작성자 본인 확인을 겸한 조회 — 타인 요청은 empty */
    Optional<ServiceRequest> findByIdAndUserId(Long id, Long userId);

    Page<ServiceRequest> findPageByUserId(Long userId, Pageable pageable);

    /** 공개 목록 — 모집 중(OPEN)만, 카테고리가 null이면 전체. 정렬은 pageable이 정한다. */
    Page<ServiceRequest> findOpenPage(ServiceCategory categoryOrNull, Pageable pageable);

    /** 여러 요청 배치 조회(삭제 제외) — 보낸 제안 목록의 요청 제목 조립용(행당 쿼리 금지) */
    List<ServiceRequest> findAllByIdIn(Collection<Long> ids);

}
