package com.allme.back.user.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.allme.back.global.crypto.HmacSha256Hasher;
import com.allme.back.global.exception.AppException;
import com.allme.back.user.application.port.IdentityVerificationPort.IdentityVerificationResult;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.domain.repository.UserRepository;
import java.util.Base64;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class UserServiceTest {

    private static final String TEST_HMAC_KEY =
        Base64.getEncoder().encodeToString("0123456789abcdef0123456789abcdef".getBytes());

    private static final String VALID_PASSWORD = "Abcdef1!";

    private UserService serviceWith(boolean loginIdExists) {
        return serviceWith(loginIdExists, false);
    }

    private UserService serviceWith(boolean loginIdExists, boolean ciExists) {
        UserRepository stubRepository = new UserRepository() {
            @Override
            public boolean existsByLoginId(String loginId) {
                return loginIdExists;
            }

            @Override
            public boolean existsByCiHash(String ciHash) {
                return ciExists;
            }

            @Override
            public User save(User user) {
                return user;
            }
        };
        HmacSha256Hasher hasher = new HmacSha256Hasher(TEST_HMAC_KEY);
        IdentityVerificationService stubVerification = new IdentityVerificationService(
            id -> new IdentityVerificationResult(
                "VERIFIED", "홍길동", "1998-01-02", "01012345678", "MALE", "ci-value", "di-value"),
            stubRepository, hasher);
        return new UserService(
            stubRepository, stubVerification, new BCryptPasswordEncoder(), hasher);
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

    @Test
    @DisplayName("가입 성공 시 loginId를 반환한다")
    void join_success() {
        assertThat(serviceWith(false).join("iv-1", "allme123", VALID_PASSWORD, true))
            .isEqualTo("allme123");
    }

    @Test
    @DisplayName("이미 존재하는 아이디로 가입하면 LOGIN_ID_DUPLICATED 예외를 던진다")
    void join_duplicatedLoginId() {
        assertThatThrownBy(() -> serviceWith(true).join("iv-1", "allme123", VALID_PASSWORD, true))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.LOGIN_ID_DUPLICATED);
    }

    @Test
    @DisplayName("같은 CI로 이미 가입된 계정이 있으면 ALREADY_REGISTERED 예외를 던진다")
    void join_alreadyRegistered() {
        assertThatThrownBy(
            () -> serviceWith(false, true).join("iv-1", "allme123", VALID_PASSWORD, true))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.ALREADY_REGISTERED);
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {
        "Abc1!",        // 8자 미만
        "abcdef1!",     // 대문자 없음
        "ABCDEF1!",     // 소문자 없음
        "Abcdefg!",     // 숫자 없음
        "Abcdefg1",     // 특수문자 없음
    })
    @DisplayName("규칙(8~64자·대/소문자·숫자·특수문자)에 어긋난 비밀번호면 PASSWORD_INVALID_FORMAT 예외를 던진다")
    void join_invalidPassword(String password) {
        assertThatThrownBy(() -> serviceWith(false).join("iv-1", "allme123", password, true))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.PASSWORD_INVALID_FORMAT);
    }

    @Test
    @DisplayName("65자 비밀번호면 PASSWORD_INVALID_FORMAT 예외를 던진다")
    void join_tooLongPassword() {
        String tooLong = "Aa1!" + "a".repeat(61);

        assertThatThrownBy(() -> serviceWith(false).join("iv-1", "allme123", tooLong, true))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.PASSWORD_INVALID_FORMAT);
    }

}
