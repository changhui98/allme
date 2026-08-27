package com.allme.back.provider.domain;

import com.allme.back.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ProviderErrorCode implements ErrorCode {

    APPLICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "P001", "신청 내역을 찾을 수 없습니다."),
    APPLICATION_ALREADY_PENDING(HttpStatus.CONFLICT, "P002", "이미 심사 중인 신청이 있습니다."),
    ALREADY_PROVIDER(HttpStatus.CONFLICT, "P003", "이미 업체 회원입니다."),
    APPLICATION_ALREADY_PROCESSED(HttpStatus.CONFLICT, "P004", "이미 처리된 신청입니다."),
    APPLICANT_NOT_AVAILABLE(HttpStatus.CONFLICT, "P005", "신청자가 탈퇴하여 처리할 수 없습니다."),
    NOT_ACTIVE_PROVIDER(HttpStatus.NOT_FOUND, "P006", "활동 중인 업체가 아닙니다.")
    ;

    private final HttpStatus status;
    private final String code;
    private final String message;

}
