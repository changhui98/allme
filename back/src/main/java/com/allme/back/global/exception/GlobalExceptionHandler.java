package com.allme.back.global.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
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

    /**
     * JSON 본문을 읽을 수 없는 요청(문법 오류, enum에 없는 값, 날짜 형식 불일치 등) —
     * 클라이언트 잘못이므로 400. 없으면 Exception 핸들러로 떨어져 500(A999)으로 새어 나간다.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleNotReadable(
        HttpMessageNotReadableException e, HttpServletRequest request
    ) {

        log.info("[NotReadable] {} {} -> {}",
            request.getMethod(), request.getRequestURI(), e.getMessage());

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse.from(ApiErrorCode.INVALID_REQUEST));
    }

    /** 멀티파트가 아니거나 필수 파트가 빠진 업로드 요청 — 클라이언트 잘못이므로 400 */
    @ExceptionHandler({MissingServletRequestPartException.class, MultipartException.class})
    public ResponseEntity<ErrorResponse> handleInvalidMultipartRequest(
        Exception e, HttpServletRequest request
    ) {

        log.info("[InvalidMultipart] {} {} -> {}",
            request.getMethod(), request.getRequestURI(), e.getMessage());

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse.from(ApiErrorCode.INVALID_REQUEST));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceededException(
        MaxUploadSizeExceededException e, HttpServletRequest request
    ) {

        log.info("[UploadTooLarge] {} {}", request.getMethod(), request.getRequestURI());

        return ResponseEntity
            .status(HttpStatus.PAYLOAD_TOO_LARGE)
            .body(ErrorResponse.from(ApiErrorCode.PAYLOAD_TOO_LARGE));
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
