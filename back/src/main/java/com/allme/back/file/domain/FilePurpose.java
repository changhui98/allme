package com.allme.back.file.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 업로드 파일의 용도. dir 값(영문 소문자)은 저장 디렉터리명이자 저장 파일명의 prefix로 쓰인다
 * (예: profile/profile_20260818143012_a1b2c3.jpg). 새 용도 추가 시 상수만 늘리면 된다.
 */
@Getter
@RequiredArgsConstructor
public enum FilePurpose {

    PROFILE("profile"),
    ;

    private final String dir;

}
