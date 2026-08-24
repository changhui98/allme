package com.allme.back.user.application.port;

import com.allme.back.user.domain.Bank;

/**
 * 계좌 예금주 실명 조회 외부 연동 포트.
 * 구현: infrastructure/portone/PortOneBankAccountHolderAdapter (포트원 V2 예금주 조회).
 */
public interface BankAccountHolderPort {

    /**
     * 예금주 실명을 조회한다.
     *
     * @param accountNumber 하이픈 제거 정규화된 계좌번호
     * @throws com.allme.back.global.exception.AppException
     *     U017(계좌 확인 불가) / U018(제공자 오류) / U019(서비스 미설정·미활성)
     */
    String getHolderName(Bank bank, String accountNumber);

}
