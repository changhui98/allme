package com.allme.back.user.domain.repository;

import com.allme.back.user.domain.entity.User;
import java.util.List;
import java.util.Optional;

public interface UserRepository {

    boolean existsByLoginId(String loginId);

    boolean existsByCiHash(String ciHash);

    boolean existsByNickname(String nickname);

    /** 닉네임 백필 대상 — 닉네임이 없는 활성(미탈퇴) 회원 */
    List<User> findAllWithoutNickname();

    Optional<User> findById(Long id);

    Optional<User> findByLoginId(String loginId);

    User save(User user);

}
