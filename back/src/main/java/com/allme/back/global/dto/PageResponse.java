package com.allme.back.global.dto;

import java.util.List;
import org.springframework.data.domain.Page;

/**
 * 페이징 API 공용 응답 — Spring Data Page를 직접 직렬화하면 계약이 불안정해
 * (PageImpl 직렬화 경고) 필요한 필드만 고정한 record로 내린다. 백엔드 첫 페이징 도입 사례.
 */
public record PageResponse<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages
) {

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages()
        );
    }

}
