package com.allme.back.provider.presentation.controller;

import com.allme.back.global.auth.RequireRole;
import com.allme.back.global.auth.SessionUsers;
import com.allme.back.global.dto.PageResponse;
import com.allme.back.provider.application.service.ProviderService;
import com.allme.back.provider.application.service.ProviderService.ActiveProvider;
import com.allme.back.provider.domain.entity.ProviderApplication;
import com.allme.back.provider.presentation.dto.request.ProviderRevokeRequest;
import com.allme.back.provider.presentation.dto.response.ActiveProviderDetailResponse;
import com.allme.back.provider.presentation.dto.response.ActiveProviderSummaryResponse;
import com.allme.back.user.domain.AdminUserRow;
import com.allme.back.user.domain.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 활동 업체 관리 — 관리자/매니저 전용(/api/admin/**). 식별자는 회원 id(userId).
 * 신청 심사는 AdminProviderApplicationController(/api/admin/provider-applications)가 담당한다.
 */
@RestController
@RequestMapping("/api/admin/providers")
@RequireRole({Role.MANAGER, Role.ADMIN})
@RequiredArgsConstructor
public class AdminProviderController {

    private final ProviderService providerService;

    /** 목록 — PROVIDER 보유 회원 최신순. 승인 신청서·승인자 loginId는 배치 조회로 채운다. */
    @GetMapping
    public PageResponse<ActiveProviderSummaryResponse> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Page<AdminUserRow> providers = providerService.getActivePage(page, size);
        List<Long> userIds = providers.getContent().stream().map(AdminUserRow::id).toList();
        Map<Long, ProviderApplication> applications = providerService.latestApprovedByUserIds(userIds);

        List<Long> approverIds = new ArrayList<>();
        for (ProviderApplication application : applications.values()) {
            if (application.getProcessedByUserId() != null) {
                approverIds.add(application.getProcessedByUserId());
            }
        }
        Map<Long, String> approverLoginIds = providerService.loginIdsOf(approverIds);

        return PageResponse.from(providers.map(row -> {
            ProviderApplication application = applications.get(row.id());
            return ActiveProviderSummaryResponse.from(
                row.id(), row.loginId(), application, approverLoginIdOf(application, approverLoginIds));
        }));
    }

    @GetMapping("/{userId}")
    public ActiveProviderDetailResponse detail(@PathVariable Long userId) {
        ActiveProvider provider = providerService.getActive(userId);
        ProviderApplication application = provider.application();
        Map<Long, String> approverLoginIds = application != null && application.getProcessedByUserId() != null
            ? providerService.loginIdsOf(List.of(application.getProcessedByUserId()))
            : Map.of();

        return ActiveProviderDetailResponse.from(
            provider.userId(), provider.loginId(), application, approverLoginIdOf(application, approverLoginIds));
    }

    /** 자격 해제 — PROVIDER 역할이 즉시 회수된다(재로그인 불필요). 사유는 이력으로 남는다. */
    @PostMapping("/{userId}/revoke")
    public void revoke(
        @PathVariable Long userId,
        @Valid @RequestBody ProviderRevokeRequest request,
        HttpServletRequest httpRequest
    ) {
        providerService.revoke(userId, SessionUsers.requireUserId(httpRequest), request.reason());
    }

    private static String approverLoginIdOf(ProviderApplication applicationOrNull, Map<Long, String> loginIds) {
        if (applicationOrNull == null || applicationOrNull.getProcessedByUserId() == null) {
            return null;
        }
        return loginIds.get(applicationOrNull.getProcessedByUserId());
    }

}
