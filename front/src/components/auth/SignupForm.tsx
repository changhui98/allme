"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import FormField from "@/components/auth/FormField";
import PasswordChecklist from "@/components/auth/PasswordChecklist";
import Modal from "@/components/common/Modal";
import { PRIMARY_CTA } from "@/lib/button-styles";
import {
  LOGIN_ID_PATTERN,
  LOGIN_ID_RULE_MESSAGE,
  isPasswordValid,
} from "@/lib/signup-validation";
import { ApiError } from "@/lib/api";
import { checkLoginIdAvailability, joinUser } from "@/lib/user";

/** 아이디 중복확인 진행 상태 — 값이 바뀌면 idle로 리셋해 확인을 무효화한다 */
type DupCheckState = {
  status: "idle" | "checking" | "available" | "taken" | "error";
  message?: string;
};

/**
 * 회원가입 정보 입력 폼 (약관 동의·본인인증 완료 후 스텝 3).
 * 이름은 본인인증 결과로 프리필하고 수정 불가 — 인증된 실명을 그대로 쓴다.
 * 약관 동의는 스텝 1에서 이미 받았고, 마케팅 수신 여부만 hidden으로 실어 보낸다.
 * 아이디 중복확인 통과 후 가입 사이의 선점(race)은 가입 API의 재검사가 최종 방어선.
 * 제출 시 개인정보는 보내지 않는다 — 백엔드가 identityVerificationId로 포트원을 재조회한다.
 * 스타일: styles/pages/auth.css
 */
export default function SignupForm({
  name,
  identityVerificationId,
  marketingConsent,
}: {
  name: string;
  identityVerificationId: string;
  marketingConsent: boolean;
}) {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [dupCheck, setDupCheck] = useState<DupCheckState>({ status: "idle" });
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  const handleLoginIdChange = (value: string) => {
    setLoginId(value);
    setDupCheck({ status: "idle" });
  };

  const handleDupCheck = async () => {
    if (!LOGIN_ID_PATTERN.test(loginId)) {
      setDupCheck({ status: "error", message: LOGIN_ID_RULE_MESSAGE });
      return;
    }
    setDupCheck({ status: "checking" });
    try {
      const available = await checkLoginIdAvailability(loginId);
      setDupCheck(
        available
          ? { status: "available", message: "사용 가능한 아이디입니다." }
          : { status: "taken", message: "이미 사용 중인 아이디입니다." },
      );
    } catch (e) {
      setDupCheck({
        status: "error",
        message:
          e instanceof Error ? e.message : "아이디 확인에 실패했습니다.",
      });
    }
  };

  const confirmMismatch =
    passwordConfirm !== "" && passwordConfirm !== password;
  const confirmMatched = passwordConfirm !== "" && passwordConfirm === password;

  const canSubmit =
    dupCheck.status === "available" &&
    isPasswordValid(password) &&
    confirmMatched;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await joinUser({
        identityVerificationId,
        loginId,
        password,
        marketingConsent,
      });
      setJoined(true);
    } catch (err) {
      if (err instanceof ApiError && err.code === "U007") {
        // 중복확인 통과 후 다른 사용자가 선점한 경우 — 아이디 필드로 안내
        setDupCheck({ status: "taken", message: err.message });
      } else {
        setSubmitError(
          err instanceof Error ? err.message : "회원가입에 실패했습니다.",
        );
      }
      setSubmitting(false);
    }
  };

  // 완료 모달이 어떤 경로(버튼·ESC·백드롭)로 닫혀도 로그인으로 보낸다 —
  // 가입이 끝난 폼에 머무는 상태를 만들지 않기 위함
  const goToLogin = () => router.push("/login");

  return (
    <>
      <form className="signup-form" onSubmit={handleSubmit}>
        <input
          type="hidden"
          name="marketing-consent"
          value={String(marketingConsent)}
        />
        <FormField
          id="name"
          label="이름"
          type="text"
          autoComplete="name"
          defaultValue={name}
          readOnly
        />
        <FormField
          id="login-id"
          label="아이디"
          type="text"
          autoComplete="username"
          placeholder="영문 소문자·숫자 4~20자"
          value={loginId}
          onChange={handleLoginIdChange}
          error={
            dupCheck.status === "taken" || dupCheck.status === "error"
              ? dupCheck.message
              : undefined
          }
          success={
            dupCheck.status === "available" ? dupCheck.message : undefined
          }
          trailing={
            <button
              type="button"
              onClick={handleDupCheck}
              disabled={loginId === "" || dupCheck.status === "checking"}
              className="signup-form__dup-check"
            >
              {dupCheck.status === "checking" ? "확인 중..." : "중복확인"}
            </button>
          }
        />
        <div>
          <FormField
            id="password"
            label="비밀번호"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            describedById="password-rules"
          />
          <PasswordChecklist password={password} id="password-rules" />
        </div>
        <FormField
          id="password-confirm"
          label="비밀번호 확인"
          type="password"
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          error={confirmMismatch ? "비밀번호가 일치하지 않습니다." : undefined}
          success={confirmMatched ? "비밀번호가 일치합니다." : undefined}
        />

        {submitError ? (
          <p className="signup-form__error" role="alert">
            {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className={`signup-form__submit ${PRIMARY_CTA}`}
        >
          {submitting ? "가입 중..." : "가입하기"}
        </button>
      </form>

      <Modal
        open={joined}
        title="회원가입 완료"
        onClose={goToLogin}
        actions={
          <button type="button" className={PRIMARY_CTA} onClick={goToLogin}>
            로그인하러 가기
          </button>
        }
      >
        {name}님, 회원가입이 완료되었습니다. 로그인 후 올미를 이용해보세요.
      </Modal>
    </>
  );
}
