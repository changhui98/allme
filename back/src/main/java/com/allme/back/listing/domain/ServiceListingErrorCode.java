package com.allme.back.listing.domain;

import com.allme.back.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ServiceListingErrorCode implements ErrorCode {

    /** 타인 소유·삭제·비공개 모두 존재를 노출하지 않도록 같은 코드로 404 */
    LISTING_NOT_FOUND(HttpStatus.NOT_FOUND, "S001", "서비스를 찾을 수 없습니다."),
    INVALID_PRICE(HttpStatus.BAD_REQUEST, "S002", "시작가를 1원 이상 입력하거나 '견적 후 결정'을 체크해주세요."),
    INVALID_REGION(HttpStatus.BAD_REQUEST, "S003", "현장형 서비스는 서울 자치구를 1개 이상 선택해야 하고, 비대면 서비스는 '온라인·지역 무관'으로만 등록할 수 있습니다."),
    IMAGE_LIMIT(HttpStatus.BAD_REQUEST, "S004", "서비스 사진은 최대 5장까지 등록할 수 있습니다."),
    IMAGE_INVALID(HttpStatus.BAD_REQUEST, "S005", "사진이 만료되었거나 유효하지 않습니다. 다시 업로드해주세요.")
    ;

    private final HttpStatus status;
    private final String code;
    private final String message;

}
