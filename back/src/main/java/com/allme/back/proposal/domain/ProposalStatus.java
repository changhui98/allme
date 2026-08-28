package com.allme.back.proposal.domain;

/** 업체 제안 상태 — 등록 시 PENDING, 클라이언트가 수락/거절하면 종결. 다른 제안이 수락되면 자동 REJECTED. */
public enum ProposalStatus {
    PENDING,   // 대기
    ACCEPTED,  // 수락됨
    REJECTED   // 거절됨
}
