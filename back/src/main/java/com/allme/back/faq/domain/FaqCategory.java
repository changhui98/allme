package com.allme.back.faq.domain;

/** FAQ 분류 — 표시 라벨은 프론트 상수(FAQ_CATEGORY_LABEL)가 담당한다. 선언 순서가 공개 목록의 분류 순서다. */
public enum FaqCategory {
    GENERAL,   // 이용 안내
    ACCOUNT,   // 회원·계정
    PROVIDER,  // 업체
    PAYMENT,   // 결제·정산
    ETC        // 기타
}
