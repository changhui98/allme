package com.allme.back.user.infrastructure.repository;

import com.allme.back.user.domain.entity.User;
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

    @Override
    public boolean existsByCiHash(String ciHash) {
        return userJpaRepository.existsByCiHash(ciHash);
    }

    /**
     * saveAndFlush인 이유: 트랜잭션 커밋 시점이 아니라 호출 지점에서 INSERT를 실행해,
     * unique 제약 위반(가입 race)을 서비스가 잡아 에러코드로 변환할 수 있게 한다.
     */
    @Override
    public User save(User user) {
        return userJpaRepository.saveAndFlush(user);
    }

}
