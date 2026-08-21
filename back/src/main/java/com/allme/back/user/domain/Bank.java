package com.allme.back.user.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 정산 계좌 은행 — enum name이 프론트 select(lib/banks.ts)와의 계약이다.
 * 표시명은 서버가 함께 내려준다(SettlementAccountResponse.bankName).
 */
@Getter
@RequiredArgsConstructor
public enum Bank {

    KB("KB국민은행"),
    SHINHAN("신한은행"),
    WOORI("우리은행"),
    HANA("하나은행"),
    NH("NH농협은행"),
    IBK("IBK기업은행"),
    SC("SC제일은행"),
    CITI("한국씨티은행"),
    KAKAO("카카오뱅크"),
    TOSS("토스뱅크"),
    KBANK("케이뱅크"),
    POST("우체국"),
    SAEMAUL("새마을금고"),
    SHINHYUP("신협"),
    SUHYUP("수협은행"),
    BUSAN("부산은행"),
    IM("iM뱅크"),
    GWANGJU("광주은행"),
    JEONBUK("전북은행"),
    JEJU("제주은행"),
    KYONGNAM("경남은행");

    private final String displayName;

}
