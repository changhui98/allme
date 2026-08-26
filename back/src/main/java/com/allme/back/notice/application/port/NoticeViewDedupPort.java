package com.allme.back.notice.application.port;

/**
 * 조회수 중복 집계 방지 — 같은 열람자가 일정 시간 안에 다시 열어도 한 번만 세기 위한 포트.
 * 구현은 Redis(RedisNoticeViewDedup). 조회수는 필수 인프라가 아니므로 구현체는 장애 시 true(집계)로 폴백한다.
 */
public interface NoticeViewDedupPort {

    /** @return 이 열람자의 창(window) 안 첫 열람이면 true — 호출부는 이때만 조회수를 올린다 */
    boolean markViewed(Long noticeId, String viewerKey);

}
