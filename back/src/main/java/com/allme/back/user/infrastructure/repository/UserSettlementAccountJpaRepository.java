package com.allme.back.user.infrastructure.repository;

import com.allme.back.user.domain.entity.UserSettlementAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSettlementAccountJpaRepository
    extends JpaRepository<UserSettlementAccount, Long> {

    Optional<UserSettlementAccount> findByUserId(Long userId);

    void deleteByUserId(Long userId);

}
