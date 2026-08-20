package com.allme.back.global.config;

import com.allme.back.global.auth.RoleGuardInterceptor;
import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;
    private final String imagesRoot;
    private final RoleGuardInterceptor roleGuardInterceptor;

    public WebConfig(
        @Value("${cors.allowed-origins}") String[] allowedOrigins,
        @Value("${app.images-root}") String imagesRoot,
        RoleGuardInterceptor roleGuardInterceptor
    ) {
        this.allowedOrigins = allowedOrigins;
        this.imagesRoot = imagesRoot;
        this.roleGuardInterceptor = roleGuardInterceptor;
    }

    /** @RequireRole 역할 인가 가드 — 어노테이션 없는 API에는 아무 영향이 없다. */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(roleGuardInterceptor).addPathPatterns("/api/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(allowedOrigins)
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            // 세션 쿠키(JSESSIONID)를 프론트(다른 오리진)와 주고받기 위함 —
            // 프론트 fetch도 credentials: "include"가 필요하다
            .allowCredentials(true);
    }

    /** 업로드 이미지 정적 서빙 — /images/** → 저장소 루트 images/ 디렉터리 */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = Path.of(imagesRoot).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler("/images/**").addResourceLocations(location);
    }

}
