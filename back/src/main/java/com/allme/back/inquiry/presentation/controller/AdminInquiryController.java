package com.allme.back.inquiry.presentation.controller;

import com.allme.back.global.auth.RequireRole;
import com.allme.back.global.auth.SessionUsers;
import com.allme.back.global.dto.PageResponse;
import com.allme.back.inquiry.application.service.InquiryService;
import com.allme.back.inquiry.domain.InquiryStatus;
import com.allme.back.inquiry.domain.entity.Inquiry;
import com.allme.back.inquiry.presentation.dto.request.InquiryAnswerRequest;
import com.allme.back.inquiry.presentation.dto.response.AdminInquiryDetailResponse;
import com.allme.back.inquiry.presentation.dto.response.AdminInquirySummaryResponse;
import com.allme.back.user.domain.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 1:1 문의 관리 — 매니저/관리자 전용(/api/admin/**). 인가는 클래스 레벨 @RequireRole. */
@RestController
@RequestMapping("/api/admin/inquiries")
@RequireRole({Role.MANAGER, Role.ADMIN})
@RequiredArgsConstructor
public class AdminInquiryController {

    private final InquiryService inquiryService;

    /** 목록 — status 미지정 시 전체, 최신순. 작성자·답변자 loginId는 한 번의 배치 조회로 채운다. */
    @GetMapping
    public PageResponse<AdminInquirySummaryResponse> list(
        @RequestParam(required = false) InquiryStatus status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Page<Inquiry> inquiries = inquiryService.getPage(status, page, size);

        Set<Long> userIds = new LinkedHashSet<>();
        for (Inquiry inquiry : inquiries.getContent()) {
            userIds.add(inquiry.getUserId());
            if (inquiry.getAnsweredByUserId() != null) {
                userIds.add(inquiry.getAnsweredByUserId());
            }
        }
        Map<Long, String> loginIds = inquiryService.loginIdsOf(userIds);

        return PageResponse.from(inquiries.map(inquiry ->
            AdminInquirySummaryResponse.from(
                inquiry, loginIds.get(inquiry.getUserId()), answeredByLoginId(inquiry, loginIds))));
    }

    @GetMapping("/{id}")
    public AdminInquiryDetailResponse detail(@PathVariable Long id) {
        Inquiry inquiry = inquiryService.getById(id);

        Set<Long> userIds = new LinkedHashSet<>();
        userIds.add(inquiry.getUserId());
        if (inquiry.getAnsweredByUserId() != null) {
            userIds.add(inquiry.getAnsweredByUserId());
        }
        Map<Long, String> loginIds = inquiryService.loginIdsOf(userIds);

        return AdminInquiryDetailResponse.from(
            inquiry, loginIds.get(inquiry.getUserId()), answeredByLoginId(inquiry, loginIds));
    }

    /** 답변 등록·수정 */
    @PostMapping("/{id}/answer")
    public void answer(
        @PathVariable Long id,
        @Valid @RequestBody InquiryAnswerRequest request,
        HttpServletRequest httpRequest
    ) {
        inquiryService.answer(id, SessionUsers.requireUserId(httpRequest), request.answer());
    }

    private static String answeredByLoginId(Inquiry inquiry, Map<Long, String> loginIds) {
        return inquiry.getAnsweredByUserId() != null ? loginIds.get(inquiry.getAnsweredByUserId()) : null;
    }

}
