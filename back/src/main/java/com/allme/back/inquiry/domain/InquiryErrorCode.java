package com.allme.back.inquiry.domain;

import com.allme.back.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum InquiryErrorCode implements ErrorCode {

    /** 타인의 문의도 존재 자체를 노출하지 않도록 같은 코드로 404 */
    INQUIRY_NOT_FOUND(HttpStatus.NOT_FOUND, "I001", "문의 내역을 찾을 수 없습니다.")
    ;

    private final HttpStatus status;
    private final String code;
    private final String message;

}
