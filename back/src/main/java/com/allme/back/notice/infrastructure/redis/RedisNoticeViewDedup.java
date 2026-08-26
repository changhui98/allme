package com.allme.back.notice.infrastructure.redis;

import com.allme.back.notice.application.port.NoticeViewDedupPort;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

/**
 * Redis SET NX EX 기반 중복 열람 판정 — 키 `allme:notice:view:{noticeId}:{viewerKey}`가 새로 만들어질 때만 true.
 * 세션 스토어와 같은 Redis를 쓰지만(StringRedisTemplate 자동 구성) 네임스페이스로 구분한다.
 * Redis 장애는 WARN만 남기고 true를 돌려 조회 자체는 막지 않는다(중복 방지만 포기).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RedisNoticeViewDedup implements NoticeViewDedupPort {

    static final String KEY_PREFIX = "allme:notice:view:";
    static final Duration WINDOW = Duration.ofHours(24);

    private final StringRedisTemplate redisTemplate;

    @Override
    public boolean markViewed(Long noticeId, String viewerKey) {
        String key = KEY_PREFIX + noticeId + ":" + viewerKey;
        try {
            Boolean created = redisTemplate.opsForValue().setIfAbsent(key, "1", WINDOW);
            return Boolean.TRUE.equals(created);
        } catch (DataAccessException e) {
            log.warn("공지 조회 중복 방지 Redis 접근 실패 — 집계는 계속 진행 (noticeId={})", noticeId, e);
            return true;
        }
    }

}
