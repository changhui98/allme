package com.allme.back.user.presentation.controller;

import com.allme.back.global.exception.AppException;
import com.allme.back.user.application.service.UserService;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.presentation.dto.request.UserJoinRequest;
import com.allme.back.user.presentation.dto.request.UserLoginRequest;
import com.allme.back.user.presentation.dto.response.LoginIdAvailabilityResponse;
import com.allme.back.user.presentation.dto.response.UserJoinResponse;
import com.allme.back.user.presentation.dto.response.UserSummaryResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** 회원가입 정보 입력 스텝의 아이디 중복확인. 형식 검증은 서비스에서 수행(U006). */
    @GetMapping("/login-id/availability")
    public LoginIdAvailabilityResponse checkLoginIdAvailability(@RequestParam String loginId) {
        return LoginIdAvailabilityResponse.from(userService.isLoginIdAvailable(loginId));
    }

    /** 회원가입 (본인인증 완료 후 정보 입력 스텝 제출). */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserJoinResponse join(@Valid @RequestBody UserJoinRequest request) {
        return UserJoinResponse.from(userService.join(
            request.identityVerificationId(),
            request.loginId(),
            request.password(),
            request.marketingConsent()
        ));
    }

    /**
     * 로그인. 성공 시 세션을 새로 발급(세션 고정 공격 방지를 위해 기존 세션 무효화)하고
     * userId를 담는다. 실패는 사유 구분 없이 U010(401) 하나로 응답한다.
     */
    @PostMapping("/login")
    public UserSummaryResponse login(
        @Valid @RequestBody UserLoginRequest request, HttpServletRequest httpRequest
    ) {
        User user = userService.login(request.loginId(), request.password());

        HttpSession oldSession = httpRequest.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        httpRequest.getSession(true).setAttribute("userId", user.getId());

        return UserSummaryResponse.from(user);
    }

    /**
     * 세션 확인 — 헤더 등 프론트가 로그인 상태를 판별할 때 호출한다.
     * 세션이 없거나 userId가 없으면 U011(401).
     */
    @GetMapping("/me")
    public UserSummaryResponse me(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        Object userId = session != null ? session.getAttribute("userId") : null;
        if (!(userId instanceof Long id)) {
            throw new AppException(UserErrorCode.UNAUTHORIZED);
        }
        return UserSummaryResponse.from(userService.getById(id));
    }

}
