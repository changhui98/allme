package com.allme.back.user.domain;

import com.allme.back.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum UserErrorCode implements ErrorCode {

    IDENTITY_VERIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "본인인증 내역을 찾을 수 없습니다."),
    IDENTITY_VERIFICATION_NOT_VERIFIED(HttpStatus.BAD_REQUEST, "U002", "본인인증이 완료되지 않았습니다."),
    IDENTITY_VERIFICATION_PROVIDER_ERROR(HttpStatus.BAD_GATEWAY, "U003", "본인인증 기관 연동 중 오류가 발생했습니다."),
    IDENTITY_VERIFICATION_NOT_CONFIGURED(HttpStatus.SERVICE_UNAVAILABLE, "U004", "본인인증 서비스가 아직 준비되지 않았습니다."),
    IDENTITY_VERIFICATION_CI_UNAVAILABLE(HttpStatus.BAD_REQUEST, "U005", "지원하지 않는 인증 수단입니다. 다른 인증서로 다시 시도해주세요."),
    LOGIN_ID_INVALID_FORMAT(HttpStatus.BAD_REQUEST, "U006", "아이디는 영문 소문자와 숫자를 사용해 4~20자로 입력해주세요."),
    LOGIN_ID_DUPLICATED(HttpStatus.CONFLICT, "U007", "이미 사용 중인 아이디입니다."),
    PASSWORD_INVALID_FORMAT(HttpStatus.BAD_REQUEST, "U008",
        "비밀번호는 8~64자로, 대문자·소문자·숫자·특수문자를 모두 포함해야 합니다."),
    ALREADY_REGISTERED(HttpStatus.CONFLICT, "U009", "이미 가입된 계정이 있습니다.")
    ;

    private final HttpStatus status;
    private final String code;
    private final String message;

}
