package com.allme.back.file.domain;

import java.time.Duration;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 업로드 파일의 용도. dir 값(영문 소문자)은 저장 디렉터리명이자 저장 파일명의 prefix로 쓰인다
 * (예: profile/profile_20260818143012_a1b2c3.jpg). 새 용도 추가 시 상수만 늘리면 된다.
 *
 * tempRetention은 임시 레코드가 승격되지 못한 채 남아 있을 수 있는 유예 시간 — 이를 넘기면
 * 청소 스케줄러가 실패 잔재로 보고 디스크 파일과 함께 지운다.
 * - PROFILE: 업로드와 승격이 한 요청 안에서 끝나므로 1시간이면 충분하다.
 * - SERVICE_REQUEST: 폼에서 먼저 업로드하고 나중에 제출(승격)하므로 작성 시간을 넉넉히 준다.
 */
@Getter
@RequiredArgsConstructor
public enum FilePurpose {

    PROFILE("profile", Duration.ofHours(1)),
    SERVICE_REQUEST("request", Duration.ofHours(24)),
    ;

    private final String dir;
    private final Duration tempRetention;

}
