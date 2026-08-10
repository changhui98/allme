package com.allme.back.global.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * 전역 예외 처리기.
 *
 * <p>원칙</p>
 * <ul>
 *     <li>{@link AppException} 은 예상된 비즈니스 예외이므로 WARN 레벨로 요약만 로깅한다.</li>
 *     <li>검증 예외는 INFO 레벨로 요청 경로와 함께 로깅한다.</li>
 *     <li>그 외 모든 {@link Exception} 은 ERROR 레벨로 스택트레이스까지 로깅한다.</li>
 * </ul>
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException e, HttpServletRequest request) {

        ErrorCode errorCode = e.getErrorCode();
        log.warn("[AppException] {} {} -> code={}, status={}, message={}",
            request.getMethod(), request.getRequestURI(),
            errorCode.getCode(), errorCode.getStatus(), errorCode.getMessage());

        return ResponseEntity
            .status(errorCode.getStatus())
            .body(ErrorResponse.from(errorCode));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
        MethodArgumentNotValidException e, HttpServletRequest request
    ) {

        String message = e.getBindingResult()
            .getFieldErrors()
            .get(0)
            .getDefaultMessage();

        log.info("[Validation] {} {} -> {}",
            request.getMethod(), request.getRequestURI(), message);

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse("VALIDATION_ERROR", message, null));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFoundException(
        NoResourceFoundException e, HttpServletRequest request
    ) {

        log.info("[NotFound] {} {}", request.getMethod(), request.getRequestURI());

        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse.from(ApiErrorCode.NOT_FOUND));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e, HttpServletRequest request) {

        log.error("[Exception] {} {} -> {}",
            request.getMethod(), request.getRequestURI(), e.getMessage(), e);

        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse.from(ApiErrorCode.INTERNAL_SERVER_ERROR));
    }

}
