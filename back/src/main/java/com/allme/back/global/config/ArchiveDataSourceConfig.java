package com.allme.back.global.config;

import javax.sql.DataSource;
import org.springframework.boot.jdbc.autoconfigure.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.simple.JdbcClient;

/**
 * 탈퇴 회원 보관 전용 DB(물리 분리) 데이터소스.
 * defaultCandidate=false — 주 DataSource 자동 구성(JPA가 쓰는 spring.datasource)을
 * 건드리지 않는 보조 빈으로만 등록한다. 아카이브는 단순 INSERT뿐이라 JPA 없이
 * JdbcClient로 접근한다(멀티 EntityManager 복잡도 회피).
 * 주 트랜잭션 매니저와 무관한 자체 커넥션(auto-commit)이므로 호출 즉시 커밋된다 —
 * UserService.withdraw의 "아카이브 먼저 커밋" 순서가 이 특성에 의존한다.
 */
@Configuration
public class ArchiveDataSourceConfig {

    @Bean(defaultCandidate = false)
    @ConfigurationProperties("archive.datasource")
    public DataSourceProperties archiveDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(defaultCandidate = false)
    public DataSource archiveDataSource() {
        return archiveDataSourceProperties().initializeDataSourceBuilder().build();
    }

    @Bean(defaultCandidate = false)
    public JdbcClient archiveJdbcClient() {
        return JdbcClient.create(archiveDataSource());
    }

}
