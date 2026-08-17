package com.allme.back.user.application.port;

/**
 * 본인인증 외부 연동 포트. (구현체: infrastructure의 포트원 어댑터)
 */
public interface IdentityVerificationPort {

    /**
     * 본인인증 건을 조회한다.
     *
     * @param identityVerificationId 프론트 SDK 호출 시 생성한 본인인증 건 ID
     */
    IdentityVerificationResult get(String identityVerificationId);

    /**
     * 본인인증 조회 결과. status가 VERIFIED일 때만 나머지 필드가 채워진다.
     * ci·di는 서버 내부에서만 쓰고(중복가입 체크·가입 저장) 프론트로 내리지 않는다.
     * di는 인증 수단에 따라 미제공일 수 있다 — 특히 현재 쓰는 KG이니시스 통합인증은
     * DI를 제공하지 않는다(포트원 공식). 다날 SMS 인증 등 추가 시에만 채워진다.
     */
    record IdentityVerificationResult(
        String status,
        String name,
        String birthDate,
        String phoneNumber,
        String gender,
        String ci,
        String di
    ) {

        public boolean isVerified() {
            return "VERIFIED".equals(status);
        }

    }

}
