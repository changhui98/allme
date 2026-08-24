package com.allme.back.user.presentation.dto.response;

import com.allme.back.user.domain.entity.UserSettlementAccount;
import java.util.Optional;

/**
 * 정산 계좌 응답 — 계좌번호는 본인 세션에서만 평문으로 내린다(암호화 저장은 유지).
 * 이 API는 세션 본인 전용(GET /me/settlement-account)이라 타인에게 노출되지 않는다.
 */
public record SettlementAccountResponse(boolean registered, Account account) {

    public record Account(
        String bank,
        String bankName,
        String accountNumber,
        String accountHolder
    ) { }

    public static SettlementAccountResponse from(Optional<UserSettlementAccount> account) {
        return account
            .map(it -> new SettlementAccountResponse(true, new Account(
                it.getBank().name(),
                it.getBank().getDisplayName(),
                it.getAccountNumber(),
                it.getAccountHolder()
            )))
            .orElseGet(() -> new SettlementAccountResponse(false, null));
    }

}
