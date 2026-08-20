package com.allme.back.global.auth;

import com.allme.back.user.domain.Role;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 역할 기반 인가 — 나열한 역할 중 하나라도 보유하면 통과(OR).
 * 컨트롤러 메서드 또는 클래스에 붙이며(메서드가 우선), 검사는 RoleGuardInterceptor가 수행한다.
 * 비로그인은 U011(401), 역할 미보유는 A003(403).
 * 역할 계층이 없으므로 상위 역할도 함께 나열할 것 — 예: @RequireRole({Role.MANAGER, Role.ADMIN})
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {

    Role[] value();

}
