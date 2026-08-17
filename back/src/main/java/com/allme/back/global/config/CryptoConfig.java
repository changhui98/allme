package com.allme.back.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class CryptoConfig {

    /**
     * 비밀번호 해시용 BCrypt 인코더. spring-security-crypto 단독 의존이라
     * 시큐리티 필터 체인 없이 인코더만 쓴다. 해시 결과는 60자 고정.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
