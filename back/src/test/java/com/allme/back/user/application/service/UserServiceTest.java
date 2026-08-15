package com.allme.back.user.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.allme.back.global.exception.AppException;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

class UserServiceTest {

    private UserService serviceWith(boolean exists) {
        UserRepository stubRepository = loginId -> exists;
        return new UserService(stubRepository);
    }

    @Test
    @DisplayName("형식에 맞고 미사용 아이디면 사용 가능(true)을 반환한다")
    void available() {
        assertThat(serviceWith(false).isLoginIdAvailable("allme123")).isTrue();
    }

    @Test
    @DisplayName("이미 존재하는 아이디면 사용 불가(false)를 반환한다")
    void taken() {
        assertThat(serviceWith(true).isLoginIdAvailable("allme123")).isFalse();
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"Allme123", "abc", "a23456789012345678901", "allme_1", "한글아이디"})
    @DisplayName("null·대문자·3자·21자·특수문자·한글이면 LOGIN_ID_INVALID_FORMAT 예외를 던진다")
    void invalidFormat(String loginId) {
        assertThatThrownBy(() -> serviceWith(false).isLoginIdAvailable(loginId))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.LOGIN_ID_INVALID_FORMAT);
    }

}
