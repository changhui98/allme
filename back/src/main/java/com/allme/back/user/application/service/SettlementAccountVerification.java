package com.allme.back.user.application.service;

import com.allme.back.user.domain.Bank;
import java.io.Serializable;

/**
 * 계좌 인증(예금주 조회) 결과 — HTTP 세션에 기록해 저장 요청과 대조한다.
 * 예금주 조회는 건당 과금이라 verify 1회 결과를 재사용하며, 예금주는 이 기록 값으로만
 * 저장한다(클라이언트가 보낸 예금주는 신뢰하지 않음).
 * Serializable: Redis 세션 스토어(Spring Session, JDK 직렬화)에 저장되므로 필수.
 * 필드를 바꾸면 기존 세션의 이 값은 역직렬화에 실패한다(30분 내 자연 소멸이라 허용).
 *
 * @param accountNumber 하이픈 제거 정규화된 계좌번호
 */
public record SettlementAccountVerification(
    Bank bank,
    String accountNumber,
    String accountHolder
) implements Serializable {
}
