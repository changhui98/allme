package com.allme.back.user.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 정산 계좌 은행 — enum name이 프론트 select(lib/banks.ts)와의 계약이다.
 * 표시명은 서버가 함께 내려준다(SettlementAccountResponse.bankName).
 * portoneName은 포트원 V2 Bank enum과의 계약(예금주 조회 API 경로에 사용) —
 * 포트원 server-sdk의 Bank 타입 기준이며 임의 변경 금지.
 */
@Getter
@RequiredArgsConstructor
public enum Bank {

    KB("KB국민은행", "KOOKMIN"),
    SHINHAN("신한은행", "SHINHAN"),
    WOORI("우리은행", "WOORI"),
    HANA("하나은행", "HANA"),
    NH("NH농협은행", "NONGHYUP"),
    IBK("IBK기업은행", "IBK"),
    SC("SC제일은행", "STANDARD_CHARTERED"),
    CITI("한국씨티은행", "CITI"),
    KAKAO("카카오뱅크", "KAKAO"),
    TOSS("토스뱅크", "TOSS"),
    KBANK("케이뱅크", "K_BANK"),
    POST("우체국", "POST"),
    SAEMAUL("새마을금고", "KFCC"),
    SHINHYUP("신협", "SHINHYUP"),
    SUHYUP("수협은행", "SUHYUP"),
    BUSAN("부산은행", "BUSAN"),
    IM("iM뱅크", "DAEGU"),
    GWANGJU("광주은행", "KWANGJU"),
    JEONBUK("전북은행", "JEONBUK"),
    JEJU("제주은행", "JEJU"),
    KYONGNAM("경남은행", "KYONGNAM");

    private final String displayName;
    private final String portoneName;

}
