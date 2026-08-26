package com.allme.back.notice.presentation.controller;

import com.allme.back.global.auth.RequireRole;
import com.allme.back.global.auth.SessionUsers;
import com.allme.back.global.dto.PageResponse;
import com.allme.back.notice.application.service.NoticeService;
import com.allme.back.notice.domain.NoticeSort;
import com.allme.back.notice.domain.entity.Notice;
import com.allme.back.notice.presentation.dto.request.NoticeSaveRequest;
import com.allme.back.notice.presentation.dto.response.AdminNoticeDetailResponse;
import com.allme.back.notice.presentation.dto.response.AdminNoticeSummaryResponse;
import com.allme.back.notice.presentation.dto.response.NoticeIdResponse;
import com.allme.back.user.domain.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** 공지사항 관리 — 매니저/관리자 전용(/api/admin/**). 인가는 클래스 레벨 @RequireRole. */
@RestController
@RequestMapping("/api/admin/notices")
@RequireRole({Role.MANAGER, Role.ADMIN})
@RequiredArgsConstructor
public class AdminNoticeController {

    private final NoticeService noticeService;

    /** 목록 — published 미지정 시 전체(비공개 포함), q는 제목·본문 부분 일치, 등록 최신순. 작성자 loginId는 배치 조회. */
    @GetMapping
    public PageResponse<AdminNoticeSummaryResponse> list(
        @RequestParam(required = false) Boolean published,
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "LATEST") NoticeSort sort,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Page<Notice> notices = noticeService.getAdminPage(published, q, sort, page, size);

        Set<Long> userIds = new LinkedHashSet<>();
        for (Notice notice : notices.getContent()) {
            userIds.add(notice.getAuthorUserId());
        }
        Map<Long, String> loginIds = noticeService.loginIdsOf(userIds);

        return PageResponse.from(notices.map(notice ->
            AdminNoticeSummaryResponse.from(notice, loginIds.get(notice.getAuthorUserId()))));
    }

    @GetMapping("/{id}")
    public AdminNoticeDetailResponse detail(@PathVariable Long id) {
        Notice notice = noticeService.getById(id);
        Map<Long, String> loginIds = noticeService.loginIdsOf(List.of(notice.getAuthorUserId()));
        return AdminNoticeDetailResponse.from(notice, loginIds.get(notice.getAuthorUserId()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NoticeIdResponse create(
        @Valid @RequestBody NoticeSaveRequest request, HttpServletRequest httpRequest
    ) {
        Notice notice = noticeService.create(
            SessionUsers.requireUserId(httpRequest),
            request.title(), request.content(), request.published(), request.pinned());
        return new NoticeIdResponse(notice.getId());
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @Valid @RequestBody NoticeSaveRequest request) {
        noticeService.update(id, request.title(), request.content(), request.published(), request.pinned());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        noticeService.delete(id);
    }

}
