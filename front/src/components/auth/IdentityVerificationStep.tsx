"use client";

import { useState } from "react";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import {
  isPortOneConfigured,
  requestIdentityVerification,
} from "@/lib/identity-verification";

type IdentityVerificationStepProps = {
  /** 인증 창에서 인증을 마쳤을 때 (데스크톱 팝업 방식) */
  onVerified: (identityVerificationId: string) => void;
  /** 상위(redirect 복귀·서버 검증)에서 내려온 에러 */
  externalError: string | null;
  /** 서버 검증 진행 중 여부 — 버튼 비활성화 */
  busy: boolean;
};

/**
 * 회원가입 스텝 1: 본인인증.
 * 버튼 클릭 시 포트원 통합인증 창(카카오톡·네이버·PASS 등)을 연다.
 * 모바일은 redirect 방식이라 인증 후 /signup 쿼리 파라미터로 복귀한다.
 */
export default function IdentityVerificationStep({
  onVerified,
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
    <div className="flex flex-col">
      <ul className="flex flex-col gap-2 text-sm text-stone-500 dark:text-stone-400">
        <li>· 안전한 거래를 위해 가입 전 본인인증이 필요해요.</li>
        <li>· 본인 명의의 인증서(네이버·PASS·토스 등)로 인증할 수 있어요.</li>
        <li>· 인증한 이름은 가입 정보에 그대로 사용돼요.</li>
      </ul>

      {isPortOneConfigured() ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={opening || busy}
          className="mt-6 w-full rounded-lg bg-primary py-3 text-[15px] font-semibold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {opening || busy ? "인증 확인 중..." : "휴대폰 본인인증"}
        </button>
      ) : (
        <p className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-4 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
          본인인증 준비 중입니다. 잠시 후 다시 이용해주세요.
          {process.env.NODE_ENV === "development" && (
            <span className="mt-1 block text-xs text-stone-400 dark:text-stone-500">
              (개발용 안내: front/.env.local에 NEXT_PUBLIC_PORTONE_STORE_ID,
              NEXT_PUBLIC_PORTONE_CHANNEL_KEY를 설정하세요)
            </span>
          )}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-center text-sm text-red-500">
          {error}
        </p>
      )}

      <SocialLoginButtons variant="signup" />
    </div>
  );
}
