package com.allme.back.request.domain;

/** 서비스 요청 상태 — 등록 시 OPEN. CLOSED는 마감(사용자 마감·매칭 완료) 기능을 위해 예약해 둔다. */
public enum ServiceRequestStatus {
    OPEN,    // 모집 중
    CLOSED   // 마감
}
