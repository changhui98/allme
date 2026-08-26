package com.allme.back.global.auth;

import com.allme.back.global.exception.AppException;
import com.allme.back.user.domain.UserErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Optional;

/**
 * 세션의 로그인 사용자 식별 — 로그인 필요 API의 공통 가드.
 * 로그인 시 UserController가 세션에 넣는 "userId"(Long)를 읽는다. 세션이 없거나 값이 없으면 U011(401).
 * 컨트롤러·인터셉터마다 같은 코드를 복사하던 것을 한곳으로 모았다(계약은 그대로).
 */
public final class SessionUsers {

    public static final String USER_ID_ATTRIBUTE = "userId";

    private SessionUsers() { }

    public static Long requireUserId(HttpServletRequest request) {
        return findUserId(request).orElseThrow(() -> new AppException(UserErrorCode.UNAUTHORIZED));
    }

    /** 공개 API에서 로그인 여부만 볼 때 — 세션을 만들지 않고, 없으면 empty. */
    public static Optional<Long> findUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        Object userId = session != null ? session.getAttribute(USER_ID_ATTRIBUTE) : null;
        return userId instanceof Long id ? Optional.of(id) : Optional.empty();
    }

}
