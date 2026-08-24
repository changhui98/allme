package com.allme.back.user.presentation.dto.response;

/** 계좌 인증 응답 — 조회된 예금주 실명. 저장은 세션에 기록된 인증 결과로 검증된다. */
public record SettlementAccountVerifyResponse(String accountHolder) { }
