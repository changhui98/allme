package com.allme.back.user.domain;

import java.time.LocalDateTime;

/**
 * 관리자 회원 목록 행 — JPQL 생성자 프로젝션 대상.
 * 평문 컬럼만 담아 암호화 컬럼(name 등) 복호화 없이 목록을 만든다.
 * 탈퇴 행은 deletedDate로 식별한다(개인정보는 이미 null).
 */
public record AdminUserRow(
    Long id,
    String loginId,
    LocalDateTime createdDate,
    LocalDateTime deletedDate
) { }
