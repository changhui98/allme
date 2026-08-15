package com.allme.back.user.infrastructure.repository;

import com.allme.back.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {

    private final UserJpaRepository userJpaRepository;

    /**
     * 탈퇴(soft delete) 회원의 loginId도 존재하는 것으로 취급한다 —
     * 재사용 허용 여부는 가입 API 설계 시 결정하며, 그때까지는 불가가 안전한 기본값.
     */
    @Override
    public boolean existsByLoginId(String loginId) {
        return userJpaRepository.existsByLoginId(loginId);
    }

}
