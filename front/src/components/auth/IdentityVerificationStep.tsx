"use client";

import { useState } from "react";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import { PRIMARY_CTA } from "@/lib/button-styles";
import {
  isPortOneConfigured,
  requestIdentityVerification,
} from "@/lib/identity-verification";

type IdentityVerificationStepProps = {
  /** 인증 창에서 인증을 마쳤을 때 (데스크톱 팝업 방식) */
  onVerified: (identityVerificationId: string) => void;
  /** 이전 스텝(약관 동의)으로 돌아가기 */
  onBack: () => void;
  /** 상위(redirect 복귀·서버 검증)에서 내려온 에러 */
  externalError: string | null;
  /** 서버 검증 진행 중 여부 — 버튼 비활성화 */
  busy: boolean;
};

/**
 * 회원가입 스텝 1: 본인인증.
 * 버튼 클릭 시 포트원 통합인증 창(카카오톡·네이버·PASS 등)을 연다.
 * 모바일은 redirect 방식이라 인증 후 /signup 쿼리 파라미터로 복귀한다.
 * 스타일: styles/pages/auth.css
 */
export default function IdentityVerificationStep({
  onVerified,
  onBack,
  externalError,
  busy,
}: IdentityVerificationStepProps) {
  const [opening, setOpening] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);

  const error = sdkError ?? externalError;

  async function handleClick() {
    setOpening(true);
    setSdkError(null);
    try {
      const identityVerificationId = await requestIdentityVerification();
      onVerified(identityVerificationId);
    } catch (e) {
      setSdkError(
        e instanceof Error ? e.message : "본인인증에 실패했습니다.",
      );
    } finally {
      setOpening(false);
    }
  }

  return (
    <div className="identity-step">
      <ul className="identity-step__list">
        <li>· 안전한 거래를 위해 가입 전 본인인증이 필요해요.</li>
        <li>· 본인 명의의 인증서(네이버·PASS·토스 등)로 인증할 수 있어요.</li>
        <li>· 인증한 이름은 가입 정보에 그대로 사용돼요.</li>
      </ul>

      {isPortOneConfigured() ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={opening || busy}
          className={`identity-step__submit ${PRIMARY_CTA}`}
        >
          {opening || busy ? "인증 확인 중..." : "휴대폰 본인인증"}
        </button>
      ) : (
        <p className="identity-step__notice">
          본인인증 준비 중입니다. 잠시 후 다시 이용해주세요.
          {process.env.NODE_ENV === "development" && (
            <span className="identity-step__notice-dev">
              (개발용 안내: front/.env.local에 NEXT_PUBLIC_PORTONE_STORE_ID,
              NEXT_PUBLIC_PORTONE_CHANNEL_KEY를 설정하세요)
            </span>
          )}
        </p>
      )}

      <button
        type="button"
        onClick={onBack}
        disabled={opening || busy}
        className="identity-step__back btn btn--outline btn--block"
      >
        이전
      </button>

      {error && (
        <p role="alert" className="identity-step__error">
          {error}
        </p>
      )}

      <SocialLoginButtons variant="signup" />
    </div>
  );
}
