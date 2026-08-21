package com.allme.back.user.presentation.dto.response;

import com.allme.back.user.domain.entity.UserSettlementAccount;
import java.util.Optional;

/** 정산 계좌 응답 — 평문 계좌번호는 절대 내리지 않는다(수정은 전체 재입력 방식). */
public record SettlementAccountResponse(boolean registered, Account account) {

    public record Account(
        String bank,
        String bankName,
        String accountNumberMasked,
        String accountHolder
    ) { }

    public static SettlementAccountResponse from(Optional<UserSettlementAccount> account) {
        return account
            .map(it -> new SettlementAccountResponse(true, new Account(
                it.getBank().name(),
                it.getBank().getDisplayName(),
                it.maskedAccountNumber(),
                it.getAccountHolder()
            )))
            .orElseGet(() -> new SettlementAccountResponse(false, null));
    }

}
