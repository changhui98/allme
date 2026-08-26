package com.allme.back.global.auth;

import com.allme.back.global.exception.ApiErrorCode;
import com.allme.back.global.exception.AppException;
import com.allme.back.user.domain.Role;
import com.allme.back.user.domain.repository.UserRoleRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * @RequireRole 인가 가드 — Spring Security 미도입 방침에 맞춘 HttpSession 기반 인터셉터.
 * 여기서 던진 AppException도 GlobalExceptionHandler(@RestControllerAdvice)가 그대로 처리한다.
 *
 * 역할은 세션에 캐시하지 않고 매 요청 DB 조회한다 — 업체 승인 즉시 PROVIDER API 사용이
 * 가능해야 하고, MANAGER/ADMIN 회수가 재로그인 전까지 유효하면 보안 결함이기 때문.
 * 쿼리는 unique(user_id, role) 인덱스를 타는 최대 4행 조회라 비용은 무시 가능하다.
 */
@Component
@RequiredArgsConstructor
public class RoleGuardInterceptor implements HandlerInterceptor {

    private final UserRoleRepository userRoleRepository;

    @Override
    public boolean preHandle(
        HttpServletRequest request, HttpServletResponse response, Object handler
    ) {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true; // 정적 리소스 등 컨트롤러 외 핸들러
        }

        RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
        if (requireRole == null) {
            requireRole = handlerMethod.getBeanType().getAnnotation(RequireRole.class);
        }
        if (requireRole == null) {
            return true; // 어노테이션 없는 API는 기존 방식(컨트롤러의 세션 검사) 그대로
        }

        Set<Role> owned = userRoleRepository.findRolesByUserId(SessionUsers.requireUserId(request));
        for (Role required : requireRole.value()) {
            if (owned.contains(required)) {
                return true;
            }
        }
        throw new AppException(ApiErrorCode.FORBIDDEN);
    }

}
