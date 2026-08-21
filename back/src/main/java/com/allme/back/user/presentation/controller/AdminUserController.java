package com.allme.back.user.presentation.controller;

import com.allme.back.global.auth.RequireRole;
import com.allme.back.global.dto.PageResponse;
import com.allme.back.user.application.service.UserAdminService;
import com.allme.back.user.domain.AdminUserRow;
import com.allme.back.user.domain.Role;
import com.allme.back.user.presentation.dto.response.AdminUserResponse;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 회원 목록 조회 — 관리자/매니저 전용. 개인정보 컬럼은 조회 자체를 하지 않는다(프로젝션). */
@RestController
@RequestMapping("/api/admin/users")
@RequireRole({Role.MANAGER, Role.ADMIN})
@RequiredArgsConstructor
public class AdminUserController {

    private final UserAdminService userAdminService;

    @GetMapping
    public PageResponse<AdminUserResponse> list(
        @RequestParam(required = false) String loginId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Page<AdminUserRow> rows = userAdminService.search(loginId, page, size);
        Map<Long, Set<Role>> roles = userAdminService.rolesOf(
            rows.getContent().stream().map(AdminUserRow::id).toList());

        return PageResponse.from(rows.map(row ->
            AdminUserResponse.from(row, roles.getOrDefault(row.id(), Set.of()))));
    }

}
