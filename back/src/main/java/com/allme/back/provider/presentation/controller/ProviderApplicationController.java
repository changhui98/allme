package com.allme.back.provider.presentation.controller;

import com.allme.back.global.auth.RequireRole;
import com.allme.back.global.exception.AppException;
import com.allme.back.provider.application.service.ProviderApplicationService;
import com.allme.back.provider.presentation.dto.request.ProviderApplicationSubmitRequest;
import com.allme.back.provider.presentation.dto.response.MyApplicationResponse;
import com.allme.back.user.domain.Role;
import com.allme.back.user.domain.UserErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * 업체 등록 신청 — 신청자(개인회원) 관점 API.
 * 클래스 레벨 @RequireRole(USER): 활성 회원만 접근(탈퇴 세션은 역할이 비어 403).
 */
@RestController
@RequestMapping("/api/provider-applications")
@RequireRole(Role.USER)
@RequiredArgsConstructor
public class ProviderApplicationController {

    private final ProviderApplicationService applicationService;

    /** 신청 제출 — 이미 업체(P003)·심사 대기 중(P002)이면 409. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MyApplicationResponse submit(
        @Valid @RequestBody ProviderApplicationSubmitRequest request, HttpServletRequest httpRequest
    ) {
        return MyApplicationResponse.from(applicationService.submit(
            sessionUserId(httpRequest),
            request.businessName(),
            request.businessRegistrationNumber(),
            request.introduction(),
            request.contactPhone()
        ));
    }

    /** 내 최신 신청 조회 — 신청 이력이 없으면 404(P001). 신청서 화면의 상태 표시용. */
    @GetMapping("/me")
    public MyApplicationResponse myLatest(HttpServletRequest httpRequest) {
        return MyApplicationResponse.from(
            applicationService.getMyLatest(sessionUserId(httpRequest)));
    }

    /** 세션에서 userId를 꺼낸다. 없으면 U011 — UserController.sessionUserId와 동일 계약. */
    private Long sessionUserId(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        Object userId = session != null ? session.getAttribute("userId") : null;
        if (!(userId instanceof Long id)) {
            throw new AppException(UserErrorCode.UNAUTHORIZED);
        }
        return id;
    }

}
