package com.allme.back.provider.presentation.dto.response;

import com.allme.back.provider.application.service.ProviderService;
import com.allme.back.provider.domain.entity.ProviderApplication;
import java.time.LocalDateTime;

/**
 * 공개 업체 프로필 — 누구나 볼 수 있는 정보만. 사업자번호·연락처·loginId·실명은 내리지 않는다.
 * businessName·introduction·providerSince는 최신 승인 신청서에서 오며, 수동 역할 부여 회원은 null.
 * contractCount는 수락된 제안 수(결제·완료 도메인 전까지의 대용 지표). 리뷰·평점·포트폴리오는 도메인 미구현이라 아직 없다.
 */
public record PublicProviderProfileResponse(
    Long userId,
    String businessName,
    String introduction,
    String nickname,
    String profileImageUrl,
    LocalDateTime providerSince,
    long contractCount
) {

    public static PublicProviderProfileResponse from(ProviderService.PublicProfile profile, long contractCount) {
        ProviderApplication application = profile.application();
        return new PublicProviderProfileResponse(
            profile.userId(),
            application != null ? application.getBusinessName() : null,
            application != null ? application.getIntroduction() : null,
            profile.nickname(),
            profile.profileImagePath() != null ? "/images/" + profile.profileImagePath() : null,
            application != null ? application.getProcessedDate() : null,
            contractCount
        );
    }

}
