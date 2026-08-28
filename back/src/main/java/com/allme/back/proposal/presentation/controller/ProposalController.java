package com.allme.back.proposal.presentation.controller;

import com.allme.back.global.auth.RequireRole;
import com.allme.back.global.auth.SessionUsers;
import com.allme.back.global.dto.PageResponse;
import com.allme.back.global.exception.AppException;
import com.allme.back.proposal.application.service.ProposalService;
import com.allme.back.proposal.domain.ProposalErrorCode;
import com.allme.back.proposal.domain.entity.Proposal;
import com.allme.back.proposal.presentation.dto.request.ProposalSubmitRequest;
import com.allme.back.proposal.presentation.dto.response.MyProposalResponse;
import com.allme.back.proposal.presentation.dto.response.ReceivedProposalResponse;
import com.allme.back.provider.application.service.ProviderService;
import com.allme.back.provider.domain.entity.ProviderApplication;
import com.allme.back.request.application.service.ServiceRequestService;
import com.allme.back.request.domain.entity.ServiceRequest;
import com.allme.back.user.domain.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * 업체 제안 API — 업체(PROVIDER)의 등록·내 제안 조회와 요청 작성자(USER)의 받은 제안 조회·수락·거절.
 * 메서드마다 역할이 달라 클래스 레벨 @RequireRole 대신 메서드 레벨로 건다(메서드가 클래스를 대체).
 * 표시용 업체명·요청 제목은 프레젠테이션 계층에서 배치 조회로 조립한다(도메인 역의존 회피).
 */
@RestController
@RequiredArgsConstructor
public class ProposalController {

    private final ProposalService proposalService;
    private final ProviderService providerService;
    private final ServiceRequestService requestService;

    /** 제안 등록 — 업체만. 마감 B002·내 요청 B003·중복 B004는 409. */
    @PostMapping("/api/service-requests/{requestId}/proposals")
    @RequireRole(Role.PROVIDER)
    @ResponseStatus(HttpStatus.CREATED)
    public MyProposalResponse submit(
        @PathVariable Long requestId,
        @Valid @RequestBody ProposalSubmitRequest request,
        HttpServletRequest httpRequest
    ) {
        Proposal proposal = proposalService.submit(
            SessionUsers.requireUserId(httpRequest), requestId, request.amount(), request.message());
        return MyProposalResponse.from(proposal, requestService.getOpen(requestId));
    }

    /** 이 요청에 내가 낸 제안 — 업체용. 없으면 404(B001). 공개 상세 화면의 "이미 제안함" 분기용. */
    @GetMapping("/api/service-requests/{requestId}/proposals/me")
    @RequireRole(Role.PROVIDER)
    public MyProposalResponse mine(@PathVariable Long requestId, HttpServletRequest httpRequest) {
        Proposal proposal = proposalService.findMine(SessionUsers.requireUserId(httpRequest), requestId)
            .orElseThrow(() -> new AppException(ProposalErrorCode.PROPOSAL_NOT_FOUND));
        return MyProposalResponse.from(proposal, requestService.getOpen(requestId));
    }

    /** 받은 제안 목록 — 요청 작성자만(타인 요청은 R001). 업체명은 최신 승인 신청서, 없으면 닉네임. */
    @GetMapping("/api/service-requests/{requestId}/proposals")
    @RequireRole(Role.USER)
    public List<ReceivedProposalResponse> received(@PathVariable Long requestId, HttpServletRequest httpRequest) {
        List<Proposal> proposals = proposalService.getReceived(SessionUsers.requireUserId(httpRequest), requestId);

        Set<Long> providerIds = new LinkedHashSet<>();
        for (Proposal proposal : proposals) {
            providerIds.add(proposal.getProviderUserId());
        }
        Map<Long, ProviderApplication> applications = providerService.latestApprovedByUserIds(providerIds);
        Map<Long, String> nicknames = proposalService.nicknamesOf(providerIds);

        return proposals.stream()
            .map(p -> ReceivedProposalResponse.from(
                p, providerNameOf(p.getProviderUserId(), applications, nicknames), nicknames.get(p.getProviderUserId())))
            .toList();
    }

    /** 제안 수락 — 요청 마감 + 다른 제안 자동 거절 */
    @PostMapping("/api/service-requests/{requestId}/proposals/{id}/accept")
    @RequireRole(Role.USER)
    public void accept(@PathVariable Long requestId, @PathVariable Long id, HttpServletRequest httpRequest) {
        proposalService.accept(SessionUsers.requireUserId(httpRequest), requestId, id);
    }

    /** 제안 거절 */
    @PostMapping("/api/service-requests/{requestId}/proposals/{id}/reject")
    @RequireRole(Role.USER)
    public void reject(@PathVariable Long requestId, @PathVariable Long id, HttpServletRequest httpRequest) {
        proposalService.reject(SessionUsers.requireUserId(httpRequest), requestId, id);
    }

    /** 내가 보낸 제안 목록 — 업체용, 최신순. 요청 제목·상태는 배치 조회로 채운다. */
    @GetMapping("/api/proposals/me")
    @RequireRole(Role.PROVIDER)
    public PageResponse<MyProposalResponse> myList(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        HttpServletRequest httpRequest
    ) {
        Page<Proposal> proposals = proposalService.getMyPage(SessionUsers.requireUserId(httpRequest), page, size);

        Set<Long> requestIds = new LinkedHashSet<>();
        for (Proposal proposal : proposals.getContent()) {
            requestIds.add(proposal.getRequestId());
        }
        Map<Long, ServiceRequest> requests = requestService.findAllByIds(requestIds).stream()
            .collect(Collectors.toMap(ServiceRequest::getId, Function.identity()));

        return PageResponse.from(proposals.map(p -> MyProposalResponse.from(p, requests.get(p.getRequestId()))));
    }

    private static String providerNameOf(
        Long providerUserId, Map<Long, ProviderApplication> applications, Map<Long, String> nicknames
    ) {
        ProviderApplication application = applications.get(providerUserId);
        if (application != null && application.getBusinessName() != null) {
            return application.getBusinessName();
        }
        return nicknames.get(providerUserId);
    }

}
