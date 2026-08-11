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
     * ci는 중복가입 체크용으로 서버 내부에서만 쓰고 프론트로 내리지 않는다.
     */
    record IdentityVerificationResult(
        String status,
        String name,
        String birthDate,
        String phoneNumber,
        String gender,
        String ci
    ) {

        public boolean isVerified() {
            return "VERIFIED".equals(status);
        }

    }

}
