package com.allme.back.provider.domain;

/** 업체 등록 신청 상태 — PENDING에서만 승인/반려로 전이할 수 있다(전이 규칙은 엔티티가 보장). */
public enum ApplicationStatus {

    /** 심사 대기 */
    PENDING,
    /** 승인 — 신청자에게 PROVIDER 역할이 부여됨 */
    APPROVED,
    /** 반려 — 사유가 남고, 새 신청으로 재신청 가능 */
    REJECTED

}
