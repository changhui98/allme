package com.allme.back.notice.presentation.controller;

import com.allme.back.global.auth.SessionUsers;
import com.allme.back.global.dto.PageResponse;
import com.allme.back.notice.application.service.NoticeService;
import com.allme.back.notice.domain.NoticeSort;
import com.allme.back.notice.presentation.dto.response.NoticeDetailResponse;
import com.allme.back.notice.presentation.dto.response.NoticeSummaryResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 공지사항 공개 API — 비로그인 포함 누구나 조회(@RequireRole 없음). 공개 공지만 노출한다. */
@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    /** 공개 목록 — 상단 고정 우선, 그 안에서 sort(기본 최신순). q가 있으면 제목·본문 부분 일치 검색. */
    @GetMapping
    public PageResponse<NoticeSummaryResponse> list(
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "LATEST") NoticeSort sort,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return PageResponse.from(
            noticeService.getPublishedPage(q, sort, page, size).map(NoticeSummaryResponse::from));
    }

    /** 공개 상세 — 열람 집계(24시간 중복 방지). 비공개·삭제·부재는 모두 404(N001). */
    @GetMapping("/{id}")
    public NoticeDetailResponse detail(@PathVariable Long id, HttpServletRequest request) {
        return NoticeDetailResponse.from(noticeService.viewPublished(id, viewerKeyOf(request)));
    }

    /** 열람자 식별 — 로그인은 userId, 비로그인은 클라이언트 IP(프록시 뒤면 X-Forwarded-For 첫 값). */
    private static String viewerKeyOf(HttpServletRequest request) {
        return SessionUsers.findUserId(request)
            .map(userId -> "u:" + userId)
            .orElseGet(() -> "ip:" + clientIp(request));
    }

    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].strip();
        }
        return request.getRemoteAddr();
    }

}
