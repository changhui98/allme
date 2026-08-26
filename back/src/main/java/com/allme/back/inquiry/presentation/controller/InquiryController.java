package com.allme.back.inquiry.presentation.controller;

import com.allme.back.global.auth.RequireRole;
import com.allme.back.global.auth.SessionUsers;
import com.allme.back.global.dto.PageResponse;
import com.allme.back.inquiry.application.service.InquiryService;
import com.allme.back.inquiry.presentation.dto.request.InquirySubmitRequest;
import com.allme.back.inquiry.presentation.dto.response.MyInquiryDetailResponse;
import com.allme.back.inquiry.presentation.dto.response.MyInquirySummaryResponse;
import com.allme.back.user.domain.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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

/** 1:1 문의 — 작성자(회원) 관점 API. 클래스 레벨 @RequireRole(USER): 활성 회원만. */
@RestController
@RequestMapping("/api/inquiries")
@RequireRole(Role.USER)
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MyInquiryDetailResponse submit(
        @Valid @RequestBody InquirySubmitRequest request, HttpServletRequest httpRequest
    ) {
        return MyInquiryDetailResponse.from(inquiryService.submit(
            SessionUsers.requireUserId(httpRequest), request.title(), request.content()));
    }

    /** 내 문의 목록 — 최신순 */
    @GetMapping("/me")
    public PageResponse<MyInquirySummaryResponse> myList(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        HttpServletRequest httpRequest
    ) {
        return PageResponse.from(
            inquiryService.getMyPage(SessionUsers.requireUserId(httpRequest), page, size)
                .map(MyInquirySummaryResponse::from));
    }

    /** 내 문의 상세 — 타인 문의는 404(I001) */
    @GetMapping("/me/{id}")
    public MyInquiryDetailResponse myDetail(@PathVariable Long id, HttpServletRequest httpRequest) {
        return MyInquiryDetailResponse.from(
            inquiryService.getMine(SessionUsers.requireUserId(httpRequest), id));
    }

}
