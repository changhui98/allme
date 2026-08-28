package com.allme.back.request.presentation.controller;

import com.allme.back.global.auth.SessionUsers;
import com.allme.back.global.dto.PageResponse;
import com.allme.back.request.application.service.ServiceRequestService;
import com.allme.back.request.domain.ServiceCategory;
import com.allme.back.request.domain.entity.ServiceRequest;
import com.allme.back.request.presentation.dto.response.OpenServiceRequestDetailResponse;
import com.allme.back.request.presentation.dto.response.OpenServiceRequestSummaryResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * "해주세요" 공개 게시판 — 비로그인 포함 누구나 조회(@RequireRole 없음).
 * 작성자 API(/api/service-requests, 클래스 레벨 USER)와 경로가 겹치지 않도록 /open 프리픽스를 쓴다.
 * 작성자 닉네임은 한 번의 배치 조회로 채운다.
 */
@RestController
@RequestMapping("/api/service-requests/open")
@RequiredArgsConstructor
public class OpenServiceRequestController {

    private final ServiceRequestService requestService;

    /** 모집 중 요청 목록 — category 미지정 시 전체, 최신순 */
    @GetMapping
    public PageResponse<OpenServiceRequestSummaryResponse> list(
        @RequestParam(required = false) ServiceCategory category,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Page<ServiceRequest> requests = requestService.getOpenPage(category, page, size);

        Set<Long> userIds = new LinkedHashSet<>();
        for (ServiceRequest request : requests.getContent()) {
            userIds.add(request.getUserId());
        }
        Map<Long, String> nicknames = requestService.nicknamesOf(userIds);

        return PageResponse.from(requests.map(request ->
            OpenServiceRequestSummaryResponse.from(request, nicknames.get(request.getUserId()))));
    }

    /** 공개 상세 — 마감된 요청도 보인다. 로그인 상태면 작성자 본인 여부(mine)를 함께 내린다. */
    @GetMapping("/{id}")
    public OpenServiceRequestDetailResponse detail(@PathVariable Long id, HttpServletRequest httpRequest) {
        ServiceRequest request = requestService.getOpen(id);
        String nickname = requestService.nicknamesOf(List.of(request.getUserId())).get(request.getUserId());
        boolean mine = SessionUsers.findUserId(httpRequest)
            .map(userId -> userId.equals(request.getUserId()))
            .orElse(false);
        return OpenServiceRequestDetailResponse.from(
            request, nickname, mine, requestService.attachmentsOf(request.getId()));
    }

}
