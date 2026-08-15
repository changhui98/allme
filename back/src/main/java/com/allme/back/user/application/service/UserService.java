package com.allme.back.user.application.service;

import com.allme.back.global.exception.AppException;
import com.allme.back.user.domain.UserErrorCode;
import com.allme.back.user.domain.repository.UserRepository;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Pattern LOGIN_ID_PATTERN = Pattern.compile("^[a-z0-9]{4,20}$");

    private final UserRepository userRepository;

    /**
     * 아이디 형식(영문 소문자+숫자 4~20자)을 검증하고 사용 가능 여부를 반환한다.
     * 형식 검증을 서비스에서 하는 이유: @RequestParam 제약 위반(ConstraintViolationException)은
     * GlobalExceptionHandler가 처리하지 않아 500으로 떨어지기 때문.
     * 중복확인 통과 후 가입 사이의 선점(race)은 가입 API의 재검사 + DB unique 제약이 막는다.
     */
    public boolean isLoginIdAvailable(String loginId) {
        if (loginId == null || !LOGIN_ID_PATTERN.matcher(loginId).matches()) {
            throw new AppException(UserErrorCode.LOGIN_ID_INVALID_FORMAT);
        }
        return !userRepository.existsByLoginId(loginId);
    }

}
