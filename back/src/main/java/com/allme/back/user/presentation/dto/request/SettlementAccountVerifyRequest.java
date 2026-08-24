package com.allme.back.user.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;

/** 계좌 인증(예금주 조회) 요청 — 형식 검증은 서비스에서 정규화 후 수행한다(U016) */
public record SettlementAccountVerifyRequest(

    @NotBlank(message = "은행을 선택해주세요.")
    String bank,

    @NotBlank(message = "계좌번호를 입력해주세요.")
    String accountNumber

) { }
