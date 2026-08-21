package com.allme.back.user.domain.repository;

import com.allme.back.user.domain.entity.UserSettlementAccount;
import java.util.Optional;

public interface UserSettlementAccountRepository {

    Optional<UserSettlementAccount> findByUserId(Long userId);

    UserSettlementAccount save(UserSettlementAccount account);

    void deleteByUserId(Long userId);

}
