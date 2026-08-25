package com.allme.back.user.presentation.dto.response;

import com.allme.back.user.domain.entity.UserSettlementAccount;
import java.util.Optional;

/**
 * 정산 계좌 응답 — 계좌번호는 마스킹(앞 3·뒤 4자리)만 내리고 평문은 절대 내리지 않는다.
 * 변경 시 프론트는 은행만 프리필하고 계좌번호를 재입력받는다(어차피 인증을 새로 해야 한다).
 */
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
