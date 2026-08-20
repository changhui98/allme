package com.allme.back.global.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.allme.back.global.exception.ApiErrorCode;
import com.allme.back.global.exception.AppException;
import com.allme.back.user.domain.Role;
import com.allme.back.user.domain.UserErrorCode;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.method.HandlerMethod;

class RoleGuardInterceptorTest {

    /** 어노테이션 조합별 핸들러 메서드를 뽑아내기 위한 테스트용 컨트롤러 모형 */
    static class PlainController {
        public void open() { }
    }

    static class AnnotatedController {
        @RequireRole(Role.ADMIN)
        public void adminOnly() { }

        @RequireRole({Role.MANAGER, Role.ADMIN})
        public void managerOrAdmin() { }
    }

    @RequireRole(Role.PROVIDER)
    static class ClassAnnotatedController {
        public void providerApi() { }

        @RequireRole(Role.ADMIN)
        public void adminOverride() { }
    }

    private RoleGuardInterceptor interceptorReturning(Set<Role> roles) {
        return new RoleGuardInterceptor(userId -> roles);
    }

    private HandlerMethod handler(Object controller, String methodName) throws Exception {
        return new HandlerMethod(controller, controller.getClass().getMethod(methodName));
    }

    private MockHttpServletRequest loggedInRequest() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.getSession(true).setAttribute("userId", 1L);
        return request;
    }

    @Test
    @DisplayName("@RequireRole이 없는 핸들러는 세션 없이도 통과한다")
    void noAnnotation_passes() throws Exception {
        boolean result = interceptorReturning(Set.of()).preHandle(
            new MockHttpServletRequest(), new MockHttpServletResponse(),
            handler(new PlainController(), "open"));

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("HandlerMethod가 아닌 핸들러(정적 리소스 등)는 통과한다")
    void nonHandlerMethod_passes() {
        boolean result = interceptorReturning(Set.of()).preHandle(
            new MockHttpServletRequest(), new MockHttpServletResponse(), new Object());

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("@RequireRole 핸들러에 비로그인으로 접근하면 UNAUTHORIZED(U011) 예외를 던진다")
    void noSession_unauthorized() throws Exception {
        HandlerMethod handler = handler(new AnnotatedController(), "adminOnly");

        assertThatThrownBy(() -> interceptorReturning(Set.of(Role.ADMIN)).preHandle(
            new MockHttpServletRequest(), new MockHttpServletResponse(), handler))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(UserErrorCode.UNAUTHORIZED);
    }

    @Test
    @DisplayName("요구 역할을 보유하지 않으면 FORBIDDEN(A003) 예외를 던진다")
    void missingRole_forbidden() throws Exception {
        HandlerMethod handler = handler(new AnnotatedController(), "adminOnly");

        assertThatThrownBy(() -> interceptorReturning(Set.of(Role.USER)).preHandle(
            loggedInRequest(), new MockHttpServletResponse(), handler))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ApiErrorCode.FORBIDDEN);
    }

    @Test
    @DisplayName("나열된 역할 중 하나만 보유해도 통과한다(OR)")
    void anyOfListedRoles_passes() throws Exception {
        HandlerMethod handler = handler(new AnnotatedController(), "managerOrAdmin");

        assertThat(interceptorReturning(Set.of(Role.USER, Role.MANAGER)).preHandle(
            loggedInRequest(), new MockHttpServletResponse(), handler)).isTrue();
    }

    @Test
    @DisplayName("클래스 레벨 @RequireRole도 적용되며 메서드 레벨이 우선한다")
    void classLevel_andMethodOverride() throws Exception {
        HandlerMethod classLevel = handler(new ClassAnnotatedController(), "providerApi");
        HandlerMethod methodOverride = handler(new ClassAnnotatedController(), "adminOverride");
        RoleGuardInterceptor providerOnly = interceptorReturning(Set.of(Role.PROVIDER));

        assertThat(providerOnly.preHandle(
            loggedInRequest(), new MockHttpServletResponse(), classLevel)).isTrue();
        // 메서드의 ADMIN 요구가 클래스의 PROVIDER 요구를 대체한다
        assertThatThrownBy(() -> providerOnly.preHandle(
            loggedInRequest(), new MockHttpServletResponse(), methodOverride))
            .isInstanceOf(AppException.class)
            .extracting(e -> ((AppException) e).getErrorCode())
            .isEqualTo(ApiErrorCode.FORBIDDEN);
    }

}
