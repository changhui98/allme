package com.allme.back.provider.presentation.controller;

import com.allme.back.proposal.application.service.ProposalService;
import com.allme.back.provider.application.service.ProviderService;
import com.allme.back.provider.presentation.dto.response.PublicProviderProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 공개 업체 프로필 — 비로그인 포함 누구나 조회(@RequireRole 없음). 관리자용 /api/admin/providers와 별개.
 * 계약 진행 수는 proposal 도메인 집계라 프레젠테이션 계층에서 조합한다(도메인 역의존 회피).
 */
@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
public class PublicProviderController {

    private final ProviderService providerService;
    private final ProposalService proposalService;

    /** 활동 중인 업체가 아니면 404(P006) */
    @GetMapping("/{userId}")
    public PublicProviderProfileResponse profile(@PathVariable Long userId) {
        return PublicProviderProfileResponse.from(
            providerService.getPublicProfile(userId), proposalService.countAcceptedByProvider(userId));
    }

}
