package com.allme.back.user.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * 회원가입 요청. 이름·CI 등 개인정보는 받지 않는다 —
 * 서버가 identityVerificationId로 포트원을 재조회해 확보한다.
 */
public record UserJoinRequest(
    @NotBlank(message = "본인인증 정보가 없습니다. 본인인증을 다시 진행해주세요.")
    String identityVerificationId,

    @NotBlank(message = "아이디를 입력해주세요.")
    String loginId,

    @NotBlank(message = "비밀번호를 입력해주세요.")
    String password,

    boolean marketingConsent
) {

}
