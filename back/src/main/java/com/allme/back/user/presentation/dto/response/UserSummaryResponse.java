package com.allme.back.user.presentation.dto.response;

import com.allme.back.user.domain.entity.User;
import java.time.LocalDateTime;
import java.util.List;

/** 로그인·세션 확인(me) 공용 회원 요약 응답 — 화면 표시에 필요한 최소 정보만 내린다. */
public record UserSummaryResponse(
    String loginId, String name, String nickname, String profileImageUrl,
    List<String> roles, boolean marketingConsent,
    /** 다음 닉네임 변경 가능 일시(KST) — 프론트가 버튼 잠금·안내에 사용. 즉시 가능하면 null */
    LocalDateTime nicknameChangeableAt
) {

    /** profileImagePath: 파일 테이블에서 조회한 저장 상대경로(UserService.getProfileImagePath), 없으면 null */
    public static UserSummaryResponse from(User user, String profileImagePath) {
        return new UserSummaryResponse(
            user.getLoginId(),
            user.getName(),
            user.getNickname(),
            toImageUrl(profileImagePath),
            // enum name을 그대로 내린다(프론트 UserRole 타입과의 계약). 정렬은 응답 안정성용.
            user.getRoles().stream().map(Enum::name).sorted().toList(),
            user.isMarketingConsent(),
            user.nicknameChangeableAt()
        );
    }

    /** 저장 상대경로 → 서빙 URL 경로 (WebConfig의 /images/** 리소스 핸들러와 계약) */
    static String toImageUrl(String profileImagePath) {
        return profileImagePath != null ? "/images/" + profileImagePath : null;
    }

}
