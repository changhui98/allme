package com.allme.back.user.presentation.dto.response;

public record UserJoinResponse(String loginId) {

    public static UserJoinResponse from(String loginId) {
        return new UserJoinResponse(loginId);
    }

}
