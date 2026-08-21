package com.allme.back.admin.presentation.controller;

import com.allme.back.admin.presentation.dto.response.AdminDashboardSummaryResponse;
import com.allme.back.global.auth.RequireRole;
import com.allme.back.provider.application.service.ProviderApplicationService;
import com.allme.back.provider.domain.ApplicationStatus;
import com.allme.back.user.application.service.UserAdminService;
import com.allme.back.user.domain.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 관리자 대시보드 — user·provider 도메인을 가로지르는 집계라 어느 한 도메인에 두지 않고
 * 프레젠테이션 계층에서 서비스들을 조합한다(admin 패키지 — 도메인 역의존 회피).
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@RequireRole({Role.MANAGER, Role.ADMIN})
@RequiredArgsConstructor
public class AdminDashboardController {

    private final UserAdminService userAdminService;
    private final ProviderApplicationService providerApplicationService;

    @GetMapping("/summary")
    public AdminDashboardSummaryResponse summary() {
        return new AdminDashboardSummaryResponse(
            userAdminService.countActiveUsers(),
            userAdminService.countProviders(),
            providerApplicationService.countByStatus(ApplicationStatus.PENDING),
            providerApplicationService.countAll()
        );
    }

}
