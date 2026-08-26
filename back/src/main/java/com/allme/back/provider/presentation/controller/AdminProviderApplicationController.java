package com.allme.back.provider.presentation.controller;

import com.allme.back.global.auth.RequireRole;
import com.allme.back.global.auth.SessionUsers;
import com.allme.back.global.dto.PageResponse;
import com.allme.back.provider.application.service.ProviderApplicationService;
import com.allme.back.provider.domain.ApplicationStatus;
import com.allme.back.provider.domain.entity.ProviderApplication;
import com.allme.back.provider.presentation.dto.request.ProviderApplicationRejectRequest;
import com.allme.back.provider.presentation.dto.response.ProviderApplicationDetailResponse;
import com.allme.back.provider.presentation.dto.response.ProviderApplicationSummaryResponse;
import com.allme.back.user.domain.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 업체 등록 신청 심사 — 관리자/매니저 전용(/api/admin/**).
 * 클래스 레벨 @RequireRole이 전 메서드를 커버한다(인가는 RoleGuardInterceptor).
 */
@RestController
@RequestMapping("/api/admin/provider-applications")
@RequireRole({Role.MANAGER, Role.ADMIN})
@RequiredArgsConstructor
public class AdminProviderApplicationController {

    private final ProviderApplicationService applicationService;

    /** 목록 — status 미지정 시 전체, 신청 최신순. 신청자·처리자 loginId는 한 번의 배치 조회로 채운다. */
    @GetMapping
    public PageResponse<ProviderApplicationSummaryResponse> list(
        @RequestParam(required = false) ApplicationStatus status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Page<ProviderApplication> applications = applicationService.getPage(status, page, size);

        List<Long> userIds = new ArrayList<>();
        for (ProviderApplication application : applications.getContent()) {
            userIds.add(application.getUserId());
            if (application.getProcessedByUserId() != null) {
                userIds.add(application.getProcessedByUserId());
            }
        }
        Map<Long, String> loginIds = applicationService.loginIdsOf(userIds);

        return PageResponse.from(applications.map(application ->
            ProviderApplicationSummaryResponse.from(
                application,
                loginIds.get(application.getUserId()),
                application.getProcessedByUserId() != null
                    ? loginIds.get(application.getProcessedByUserId())
                    : null
            )));
    }

    @GetMapping("/{id}")
    public ProviderApplicationDetailResponse detail(@PathVariable Long id) {
        ProviderApplication application = applicationService.getById(id);

        List<Long> userIds = new ArrayList<>();
        userIds.add(application.getUserId());
        if (application.getProcessedByUserId() != null) {
            userIds.add(application.getProcessedByUserId());
        }
        Map<Long, String> loginIds = applicationService.loginIdsOf(userIds);

        return ProviderApplicationDetailResponse.from(
            application,
            loginIds.get(application.getUserId()),
            application.getProcessedByUserId() != null
                ? loginIds.get(application.getProcessedByUserId())
                : null
        );
    }

    /** 승인 — 신청자에게 PROVIDER 역할이 즉시 부여된다(재로그인 불필요). */
    @PostMapping("/{id}/approve")
    public void approve(@PathVariable Long id, HttpServletRequest httpRequest) {
        applicationService.approve(id, SessionUsers.requireUserId(httpRequest));
    }

    @PostMapping("/{id}/reject")
    public void reject(
        @PathVariable Long id,
        @Valid @RequestBody ProviderApplicationRejectRequest request,
        HttpServletRequest httpRequest
    ) {
        applicationService.reject(id, SessionUsers.requireUserId(httpRequest), request.reason());
    }

}
