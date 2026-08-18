package com.allme.back.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** @Scheduled 활성화 — 메인 클래스 대신 설정 클래스로 분리해 테스트 슬라이스에서 제어하기 쉽게 한다. */
@Configuration
@EnableScheduling
public class SchedulingConfig {

}
