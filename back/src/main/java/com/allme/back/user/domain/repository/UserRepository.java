package com.allme.back.user.domain.repository;

public interface UserRepository {

    boolean existsByLoginId(String loginId);

}
