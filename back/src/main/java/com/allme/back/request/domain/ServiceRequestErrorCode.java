package com.allme.back.request.domain;

import com.allme.back.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ServiceRequestErrorCode implements ErrorCode {

    /** 타인의 요청도 존재 자체를 노출하지 않도록 같은 코드로 404 */
    REQUEST_NOT_FOUND(HttpStatus.NOT_FOUND, "R001", "요청 내역을 찾을 수 없습니다."),
    INVALID_SCHEDULE(HttpStatus.BAD_REQUEST, "R002", "희망 일정을 선택하거나 '협의 가능'을 체크해주세요."),
    INVALID_BUDGET(HttpStatus.BAD_REQUEST, "R003", "희망 예산은 최소·최대를 모두 입력하고 최소가 최대 이하여야 합니다. 정해지지 않았다면 '제안 받아요'를 체크해주세요."),
    INVALID_REGION(HttpStatus.BAD_REQUEST, "R004", "이 카테고리에서는 선택한 지역 또는 상세 주소를 사용할 수 없습니다."),
    ATTACHMENT_LIMIT(HttpStatus.BAD_REQUEST, "R005", "참고 사진은 최대 5장까지 첨부할 수 있습니다."),
    ATTACHMENT_INVALID(HttpStatus.BAD_REQUEST, "R006", "첨부 이미지가 만료되었거나 유효하지 않습니다. 다시 업로드해주세요."),
    REQUEST_NOT_OPEN(HttpStatus.CONFLICT, "R007", "이미 마감된 요청입니다.")
    ;

    private final HttpStatus status;
    private final String code;
    private final String message;

}
