package com.allme.back.notice.domain;

/** 공지 목록 정렬 — 어느 쪽이든 상단 고정(pinned)이 먼저 온다(NoticeService.sortOf). */
public enum NoticeSort {
    LATEST,  // 최신순 (id desc)
    VIEWS    // 조회순 (viewCount desc, id desc)
}
