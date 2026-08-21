package com.allme.back.user.infrastructure.repository;

import com.allme.back.user.domain.entity.UserSettlementAccount;
import com.allme.back.user.domain.repository.UserSettlementAccountRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserSettlementAccountRepositoryImpl implements UserSettlementAccountRepository {

    private final UserSettlementAccountJpaRepository jpaRepository;

    @Override
    public Optional<UserSettlementAccount> findByUserId(Long userId) {
        return jpaRepository.findByUserId(userId);
    }

    @Override
    public UserSettlementAccount save(UserSettlementAccount account) {
        return jpaRepository.save(account);
    }

    @Override
    public void deleteByUserId(Long userId) {
        jpaRepository.deleteByUserId(userId);
    }

}
