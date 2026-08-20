package com.allme.back.user.domain;

/**
 * 계정 역할 — 한 계정이 여러 역할을 동시에 보유할 수 있다(user_roles 테이블, 계정-역할 분리).
 * 계층(hierarchy) 로직은 두지 않는다: 4종뿐이라 인가 지점(@RequireRole)에서
 * 허용 역할을 명시적으로 나열하는 편이 단순하고 오해가 없다(예: {MANAGER, ADMIN}).
 */
public enum Role {

    /** 일반 사용자 — 가입 시 기본 부여 */
    USER,
    /** 업체 — 업체 등록/승인 시 부여(겸직 가능) */
    PROVIDER,
    /** 매니저 — 플랫폼 운영 스태프. 업체 승인·분쟁 처리 등 일부 운영 기능 */
    MANAGER,
    /** 관리자 — 회원 삭제·정산 등 민감 기능 포함 전체 운영 권한 */
    ADMIN

}
