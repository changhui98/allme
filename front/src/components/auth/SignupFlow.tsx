"use client";

import { useCallback, useEffect, useState } from "react";
import AuthHeading from "@/components/auth/AuthHeading";
import ConsentStep from "@/components/auth/ConsentStep";
import IdentityVerificationStep from "@/components/auth/IdentityVerificationStep";
import SignupForm from "@/components/auth/SignupForm";
import SignupStepper from "@/components/auth/SignupStepper";
import {
  verifyIdentityOnServer,
  type VerifiedCustomer,
} from "@/lib/identity-verification";

export type SignupStep = "consent" | "verify" | "form";

/** redirect 복귀로 state가 사라져도 동의(마케팅 선택) 여부를 복원하기 위한 키 */
const CONSENT_STORAGE_KEY = "allme.signup.consent";

/** 스텝별 제목/안내 — AuthShell 대신 스텝이 바뀔 때마다 여기서 갈아끼운다 */
const STEP_META: Record<SignupStep, { title: string; description: string }> = {
  consent: {
    title: "약관 동의",
    description: "올미 이용을 위해 약관을 확인하고 동의해주세요.",
  },
  verify: {
    title: "본인인증",
    description: "안전한 거래를 위해 본인인증이 필요해요.",
  },
  form: {
    title: "정보 입력",
    description: "마지막 단계예요. 로그인에 사용할 정보를 입력해주세요.",
  },
};

type SignupFlowProps = {
  /** 모바일 redirect 복귀 시 쿼리로 전달된 본인인증 건 ID */
  initialVerificationId?: string;
  /** redirect 복귀 시 쿼리로 전달된 인증 실패 메시지 */
  initialError?: string;
};

/**
 * 회원가입 스텝 플로우: 약관 동의(consent) → 본인인증(verify) → 정보 입력(form).
 * 인증 결과는 컴포넌트 state로만 관리 — redirect로 state가 날아가도
 * 쿼리의 identityVerificationId만 있으면 서버 검증으로 복원된다.
 * (redirect 복귀는 동의를 이미 거친 상태이므로 동의 스텝을 건너뛴다.)
 * 스타일: styles/pages/auth.css
 */
export default function SignupFlow({
  initialVerificationId,
  initialError,
}: SignupFlowProps) {
  const [step, setStep] = useState<SignupStep>(
    // redirect 복귀(인증 ID 또는 인증 실패)면 동의는 끝난 상태
    initialVerificationId || initialError ? "verify" : "consent",
  );
  const [checking, setChecking] = useState(Boolean(initialVerificationId));
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [customer, setCustomer] = useState<VerifiedCustomer | null>(null);
  // 가입 완료 API 연동 시 함께 전송할 값 — redirect 복귀 시 sessionStorage에서 복원
  // (렌더에 영향 없는 값이라 lazy init의 서버/클라이언트 차이는 hydration에 무해)
  const [marketingConsent, setMarketingConsent] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = sessionStorage.getItem(CONSENT_STORAGE_KEY);
      return saved ? Boolean(JSON.parse(saved).marketing) : false;
    } catch {
      return false;
    }
  });

  const handleAgreed = useCallback((consent: { marketing: boolean }) => {
    setMarketingConsent(consent.marketing);
    try {
      sessionStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
    } catch {
      // 저장 불가(시크릿 모드 등)여도 가입 진행에는 지장 없음
    }
    setStep("verify");
  }, []);

  const runVerification = useCallback(async (identityVerificationId: string) => {
    try {
      const verified = await verifyIdentityOnServer(identityVerificationId);
      setCustomer(verified);
      setStep("form");
      // redirect 복귀 쿼리가 주소창에 남지 않게 정리 (새로고침 시 재검증 방지)
      window.history.replaceState(null, "", "/signup");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "본인인증 확인에 실패했습니다.",
      );
    } finally {
      setChecking(false);
    }
  }, []);

  // 데스크톱 팝업 방식: 인증 창이 닫힌 뒤 호출된다
  const handleVerified = useCallback(
    (identityVerificationId: string) => {
      setChecking(true);
      setError(null);
      void runVerification(identityVerificationId);
    },
    [runVerification],
  );

  // 모바일 redirect 방식: 쿼리로 복귀한 경우 (checking 초기값이 이미 true)
  useEffect(() => {
    if (initialVerificationId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 1회 서버 검증(비동기 fetch) 결과 반영
      void runVerification(initialVerificationId);
    }
  }, [initialVerificationId, runVerification]);

  // form이지만 검증 결과가 아직 없으면 기존처럼 인증 화면을 유지한다
  const visibleStep: SignupStep =
    step === "form" && !customer ? "verify" : step;

  return (
    <div className="signup-flow">
      <SignupStepper current={visibleStep} />
      <div className="signup-flow__heading">
        <AuthHeading {...STEP_META[visibleStep]} />
      </div>
      <div className="signup-flow__body">
        {visibleStep === "consent" ? (
          <ConsentStep onAgreed={handleAgreed} />
        ) : visibleStep === "form" && customer ? (
          <SignupForm
            name={customer.name}
            marketingConsent={marketingConsent}
          />
        ) : (
          <IdentityVerificationStep
            onVerified={handleVerified}
            externalError={error}
            busy={checking}
          />
        )}
      </div>
    </div>
  );
}
