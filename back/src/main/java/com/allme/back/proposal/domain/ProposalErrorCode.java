package com.allme.back.proposal.domain;

import com.allme.back.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ProposalErrorCode implements ErrorCode {

    PROPOSAL_NOT_FOUND(HttpStatus.NOT_FOUND, "B001", "제안을 찾을 수 없습니다."),
    REQUEST_NOT_OPEN(HttpStatus.CONFLICT, "B002", "마감된 요청에는 제안할 수 없습니다."),
    OWN_REQUEST(HttpStatus.CONFLICT, "B003", "내가 올린 요청에는 제안할 수 없습니다."),
    ALREADY_PROPOSED(HttpStatus.CONFLICT, "B004", "이미 이 요청에 제안했습니다."),
    ALREADY_DECIDED(HttpStatus.CONFLICT, "B005", "이미 처리된 제안입니다.")
    ;

    private final HttpStatus status;
    private final String code;
    private final String message;

}
