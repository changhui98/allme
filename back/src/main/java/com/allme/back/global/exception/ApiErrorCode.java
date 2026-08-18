package com.allme.back.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ApiErrorCode implements ErrorCode {

    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "A001", "잘못된 요청입니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "A002", "인증이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "A003", "접근 권한이 없습니다."),
    NOT_FOUND(HttpStatus.NOT_FOUND, "A004", "요청한 리소스를 찾을 수 없습니다."),
    PAYLOAD_TOO_LARGE(HttpStatus.PAYLOAD_TOO_LARGE, "A005", "업로드 파일이 허용 크기를 초과했습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "A999", "서버 내부 오류가 발생했습니다.")
    ;

    private final HttpStatus status;
    private final String code;
    private final String message;

}
