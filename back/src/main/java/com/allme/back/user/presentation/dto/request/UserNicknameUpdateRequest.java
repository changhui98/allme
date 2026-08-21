package com.allme.back.user.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;

/** 형식(길이·허용 문자) 검증은 서비스에서 정규화 후 수행한다(U014) */
public record UserNicknameUpdateRequest(

    @NotBlank(message = "닉네임을 입력해주세요.")
    String nickname

) { }
