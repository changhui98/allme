package com.allme.back.global.config;

import java.time.Clock;
import java.time.ZoneId;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ClockConfig {

    /**
     * 도메인 시간 기준을 Asia/Seoul로 통일한다 (BaseEntity의 KST_CLOCK과 동일 기준).
     * 빈으로 두는 이유: 시간이 로직에 들어가는 서비스(파일명 생성·임시파일 청소 등)가
     * 테스트에서 Clock.fixed()를 주입받을 수 있게 하기 위함.
     */
    @Bean
    public Clock clock() {
        return Clock.system(ZoneId.of("Asia/Seoul"));
    }

}
