package com.allme.back.user.presentation.dto.response;

import com.allme.back.user.domain.entity.User;

/** 로그인·세션 확인(me) 공용 회원 요약 응답 — 화면 표시에 필요한 최소 정보만 내린다. */
public record UserSummaryResponse(String loginId, String name) {

    public static UserSummaryResponse from(User user) {
        return new UserSummaryResponse(user.getLoginId(), user.getName());
    }

}
