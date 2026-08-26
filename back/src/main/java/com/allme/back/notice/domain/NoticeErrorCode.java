package com.allme.back.notice.domain;

import com.allme.back.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum NoticeErrorCode implements ErrorCode {

    NOTICE_NOT_FOUND(HttpStatus.NOT_FOUND, "N001", "공지사항을 찾을 수 없습니다.")
    ;

    private final HttpStatus status;
    private final String code;
    private final String message;

}
