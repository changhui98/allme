package com.allme.back.user.presentation.controller;

import com.allme.back.user.application.service.UserService;
import com.allme.back.user.presentation.dto.response.LoginIdAvailabilityResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

}
