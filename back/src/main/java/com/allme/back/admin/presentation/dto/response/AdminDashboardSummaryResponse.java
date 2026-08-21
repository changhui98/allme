package com.allme.back.admin.presentation.dto.response;

/** 관리자 대시보드 요약 숫자 */
public record AdminDashboardSummaryResponse(
    long activeUserCount,
    long providerCount,
    long pendingApplicationCount,
    long totalApplicationCount
) { }
