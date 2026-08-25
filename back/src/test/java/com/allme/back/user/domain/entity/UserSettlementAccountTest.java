package com.allme.back.user.domain.entity;

import static org.assertj.core.api.Assertions.assertThat;

import com.allme.back.user.domain.Bank;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UserSettlementAccountTest {

    @Test
    @DisplayName("마스킹은 앞 3자리·뒤 4자리만 남기고 가운데를 자릿수만큼 *로 가린다")
    void masksMiddleDigits() {
        UserSettlementAccount account =
            UserSettlementAccount.create(1L, Bank.KB, "69500201208005", "홍길동");

        assertThat(account.maskedAccountNumber()).isEqualTo("695*******8005");
    }

    @Test
    @DisplayName("최소 길이(8자리)도 가운데 1자리는 가려진다")
    void masksMinimumLength() {
        UserSettlementAccount account =
            UserSettlementAccount.create(1L, Bank.KB, "12345678", "홍길동");

        assertThat(account.maskedAccountNumber()).isEqualTo("123*5678");
    }

}
