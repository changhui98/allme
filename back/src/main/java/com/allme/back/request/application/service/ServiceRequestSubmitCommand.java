package com.allme.back.request.application.service;

import com.allme.back.request.domain.Region;
import com.allme.back.request.domain.ServiceCategory;
import java.time.LocalDate;
import java.util.List;

/**
 * 요청 등록 입력 — 필드가 많아 컨트롤러가 positional 인자 대신 이 record로 서비스에 넘긴다
 * (presentation → application 방향 의존이라 계층 규칙에 맞다). 검증 어노테이션은 presentation DTO 몫.
 */
public record ServiceRequestSubmitCommand(
    ServiceCategory category,
    String title,
    String content,
    Region region,
    String addressDetail,
    LocalDate preferredDate,
    boolean scheduleNegotiable,
    Long budgetMin,
    Long budgetMax,
    boolean budgetNegotiable,
    Integer unitValue,
    /** 먼저 업로드해 둔 임시 파일 id(표시 순서대로) — null이면 첨부 없음 */
    List<Long> attachmentTempFileIds
) { }
