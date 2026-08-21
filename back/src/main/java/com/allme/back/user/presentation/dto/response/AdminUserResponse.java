package com.allme.back.user.presentation.dto.response;

import com.allme.back.user.domain.AdminUserRow;
import com.allme.back.user.domain.Role;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/** 관리자 회원 목록 행 — 개인정보(이름 등)는 내리지 않는다(loginId로 식별). */
public record AdminUserResponse(
    Long id,
    String loginId,
    List<String> roles,
    LocalDateTime createdDate,
    boolean withdrawn
) {

    public static AdminUserResponse from(AdminUserRow row, Set<Role> roles) {
        return new AdminUserResponse(
            row.id(),
            row.loginId(),
            roles.stream().map(Enum::name).sorted().toList(),
            row.createdDate(),
            row.deletedDate() != null
        );
    }

}
