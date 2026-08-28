package com.allme.back.request.presentation.controller;

import com.allme.back.global.auth.RequireRole;
import com.allme.back.global.auth.SessionUsers;
import com.allme.back.global.dto.PageResponse;
import com.allme.back.global.exception.AppException;
import com.allme.back.request.application.service.ServiceRequestService;
import com.allme.back.request.domain.ServiceRequestErrorCode;
import com.allme.back.request.domain.entity.ServiceRequest;
import com.allme.back.request.presentation.dto.request.ServiceRequestSubmitRequest;
import com.allme.back.request.presentation.dto.response.MyServiceRequestDetailResponse;
import com.allme.back.request.presentation.dto.response.MyServiceRequestSummaryResponse;
import com.allme.back.request.presentation.dto.response.ServiceRequestAttachmentUploadResponse;
import com.allme.back.user.domain.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** 서비스 요청("해주세요") — 작성자(회원) 관점 API. 클래스 레벨 @RequireRole(USER): 활성 회원만. */
@RestController
@RequestMapping("/api/service-requests")
@RequireRole(Role.USER)
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService requestService;

    /**
     * 참고 사진 임시 업로드 — multipart "image" 파트, 5MB·jpg/jpeg/png/webp.
     * 제출 전 미리보기용 previewUrl과, 제출 본문에 넣을 tempFileId를 돌려준다.
     */
    @PostMapping("/attachments")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceRequestAttachmentUploadResponse uploadAttachment(
        @RequestParam("image") MultipartFile image, HttpServletRequest httpRequest
    ) {
        Long userId = SessionUsers.requireUserId(httpRequest);

        byte[] content;
        try {
            content = image.getBytes();
        } catch (IOException e) {
            throw new AppException(ServiceRequestErrorCode.ATTACHMENT_INVALID);
        }
        String originalFilename = image.getOriginalFilename();
        return ServiceRequestAttachmentUploadResponse.from(
            requestService.uploadAttachment(userId, content, extensionOf(originalFilename), originalFilename));
    }

    /** 요청 등록 — 규칙 위반은 R002~R006(400). */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MyServiceRequestDetailResponse submit(
        @Valid @RequestBody ServiceRequestSubmitRequest request, HttpServletRequest httpRequest
    ) {
        ServiceRequest created =
            requestService.submit(SessionUsers.requireUserId(httpRequest), request.toCommand());
        return detailOf(created);
    }

    /** 내 요청 목록 — 최신순 */
    @GetMapping("/me")
    public PageResponse<MyServiceRequestSummaryResponse> myList(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        HttpServletRequest httpRequest
    ) {
        return PageResponse.from(
            requestService.getMyPage(SessionUsers.requireUserId(httpRequest), page, size)
                .map(MyServiceRequestSummaryResponse::from));
    }

    /** 내 요청 상세 — 타인 요청은 404(R001) */
    @GetMapping("/me/{id}")
    public MyServiceRequestDetailResponse myDetail(@PathVariable Long id, HttpServletRequest httpRequest) {
        return detailOf(requestService.getMine(SessionUsers.requireUserId(httpRequest), id));
    }

    private MyServiceRequestDetailResponse detailOf(ServiceRequest request) {
        return MyServiceRequestDetailResponse.from(request, requestService.attachmentsOf(request.getId()));
    }

    private static String extensionOf(String filename) {
        if (filename == null) {
            return null;
        }
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1) : null;
    }

}
