package com.allme.back.user.presentation.dto.response;

/** 랜덤 닉네임 제안 — 저장 전 후보일 뿐이라 유저 정보는 담지 않는다 */
public record NicknameSuggestionResponse(String nickname) { }
