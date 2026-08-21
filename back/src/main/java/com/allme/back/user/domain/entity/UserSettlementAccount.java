package com.allme.back.user.domain.entity;

import com.allme.back.global.crypto.EncryptedStringConverter;
import com.allme.back.global.entity.BaseEntity;
import com.allme.back.user.domain.Bank;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 정산 계좌 — 1인 1계좌(user_id unique). users 컬럼이 아닌 별도 테이블인 이유:
 * users에 두면 로그인·me 등 모든 세션 확인에서 계좌번호까지 복호화된다(비용·노출면 확대).
 * 계좌번호·예금주는 암호화 저장하고, 응답에는 마스킹만 내린다(평문 미노출).
 * User와는 관례대로 JPA 연관 없이 userId(Long)로만 연결한다.
 * 탈퇴 시 아카이브 이관 후 본 DB에서 삭제한다(UserService.withdraw).
 */
@Entity
@Table(name = "user_settlement_accounts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserSettlementAccount extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Bank bank;

    /** 하이픈 제거 숫자만 저장(정규화는 서비스가 수행) */
    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "account_number", nullable = false, length = 512)
    private String accountNumber;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "account_holder", nullable = false, length = 512)
    private String accountHolder;

    private UserSettlementAccount(
        Long userId, Bank bank, String accountNumber, String accountHolder
    ) {
        this.userId = userId;
        this.bank = bank;
        this.accountNumber = accountNumber;
        this.accountHolder = accountHolder;
    }

    public static UserSettlementAccount create(
        Long userId, Bank bank, String accountNumber, String accountHolder
    ) {
        return new UserSettlementAccount(userId, bank, accountNumber, accountHolder);
    }

    public void change(Bank bank, String accountNumber, String accountHolder) {
        this.bank = bank;
        this.accountNumber = accountNumber;
        this.accountHolder = accountHolder;
    }

    /** 뒤 4자리만 노출 — 앞자리는 자릿수 정보까지 숨기려 고정 길이 마스킹 */
    public String maskedAccountNumber() {
        String tail = accountNumber.length() > 4
            ? accountNumber.substring(accountNumber.length() - 4)
            : accountNumber;
        return "****" + tail;
    }

}
