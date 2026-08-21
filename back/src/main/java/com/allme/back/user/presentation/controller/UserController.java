package com.allme.back.user.presentation.controller;

import com.allme.back.global.exception.AppException;
import com.allme.back.user.application.service.UserService;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.entity.User;
import com.allme.back.user.presentation.dto.request.MarketingConsentUpdateRequest;
import com.allme.back.user.presentation.dto.request.UserJoinRequest;
import com.allme.back.user.presentation.dto.request.UserLoginRequest;
import com.allme.back.user.presentation.dto.request.UserNicknameUpdateRequest;
import com.allme.back.user.presentation.dto.request.UserWithdrawRequest;
import com.allme.back.user.presentation.dto.response.LoginIdAvailabilityResponse;
import com.allme.back.user.presentation.dto.response.NicknameSuggestionResponse;
import com.allme.back.user.presentation.dto.response.UserJoinResponse;
import com.allme.back.user.presentation.dto.response.UserSummaryResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

        return summaryOf(user);
    }

    /** 로그아웃 — 세션이 있으면 무효화하고, 없어도 성공으로 응답한다(멱등). */
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    /**
     * 세션 확인 — 헤더 등 프론트가 로그인 상태를 판별할 때 호출한다.
     * 세션이 없거나 userId가 없으면 U011(401).
     */
    @GetMapping("/me")
    public UserSummaryResponse me(HttpServletRequest httpRequest) {
        return summaryOf(userService.getById(sessionUserId(httpRequest)));
    }

    /**
     * 프로필 이미지 업로드(교체). multipart "image" 파트, 5MB·jpg/jpeg/png/webp 제한.
     * 확장자는 원본 파일명에서만 취하고 저장 파일명은 서버가 생성한다(원본명은 파일 테이블에 보관).
     */
    @PostMapping("/me/profile-image")
    public UserSummaryResponse uploadProfileImage(
        @RequestParam("image") MultipartFile image, HttpServletRequest httpRequest
    ) {
        Long userId = sessionUserId(httpRequest);

        byte[] content;
        try {
            content = image.getBytes();
        } catch (IOException e) {
            throw new AppException(UserErrorCode.PROFILE_IMAGE_INVALID);
        }
        String originalFilename = image.getOriginalFilename();
        userService.updateProfileImage(userId, content, extensionOf(originalFilename), originalFilename);

        return summaryOf(userService.getById(userId));
    }

    /** 닉네임 변경 — 형식 오류 U014(400), 중복 U015(409). 성공 시 갱신된 요약 반환. */
    @PatchMapping("/me/nickname")
    public UserSummaryResponse updateNickname(
        @Valid @RequestBody UserNicknameUpdateRequest request, HttpServletRequest httpRequest
    ) {
        return summaryOf(
            userService.updateNickname(sessionUserId(httpRequest), request.nickname()));
    }

    /** 랜덤 닉네임 제안 — 저장하지 않고 유니크한 후보만 내려준다("랜덤 다시 뽑기"). */
    @GetMapping("/me/nickname/random")
    public NicknameSuggestionResponse randomNickname(HttpServletRequest httpRequest) {
        sessionUserId(httpRequest); // 로그인 가드
        return new NicknameSuggestionResponse(userService.suggestNickname());
    }

    /** 마케팅 수신 동의 변경 — 변경 일시가 함께 기록된다. */
    @PatchMapping("/me/marketing-consent")
    public UserSummaryResponse updateMarketingConsent(
        @Valid @RequestBody MarketingConsentUpdateRequest request, HttpServletRequest httpRequest
    ) {
        return summaryOf(userService.updateMarketingConsent(
            sessionUserId(httpRequest), request.marketingConsent()));
    }

    /** 회원탈퇴 — 비밀번호 재확인 후 soft delete + 개인정보 익명화, 세션 무효화. */
    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void withdraw(
        @Valid @RequestBody UserWithdrawRequest request, HttpServletRequest httpRequest
    ) {
        userService.withdraw(sessionUserId(httpRequest), request.password());

        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    /** 회원 요약 응답 조립 — 프로필 이미지 경로는 파일 테이블에서 조회한다. */
    private UserSummaryResponse summaryOf(User user) {
        return UserSummaryResponse.from(user, userService.getProfileImagePath(user));
    }

    /** 세션에서 userId를 꺼낸다. 없으면 U011 — 로그인 필요 API 공통 가드. */
    private Long sessionUserId(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        Object userId = session != null ? session.getAttribute("userId") : null;
        if (!(userId instanceof Long id)) {
            throw new AppException(UserErrorCode.UNAUTHORIZED);
        }
        return id;
    }

    private String extensionOf(String filename) {
        if (filename == null) {
            return null;
        }
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1) : null;
    }

}
