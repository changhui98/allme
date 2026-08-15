"use client";

import { useState } from "react";
import FormField from "@/components/auth/FormField";
import PasswordChecklist from "@/components/auth/PasswordChecklist";
import { PRIMARY_CTA } from "@/lib/button-styles";
import {
  LOGIN_ID_PATTERN,
  LOGIN_ID_RULE_MESSAGE,
  isPasswordValid,
} from "@/lib/signup-validation";
import { checkLoginIdAvailability } from "@/lib/user";

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
 * 가입 제출은 백엔드 user 도메인 가입(join) API 구현 후 붙인다.
 * 스타일: styles/pages/auth.css
 */
export default function SignupForm({
  name,
  marketingConsent,
}: {
  name: string;
  marketingConsent: boolean;
}) {
  const [loginId, setLoginId] = useState("");
  const [dupCheck, setDupCheck] = useState<DupCheckState>({ status: "idle" });
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

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

  return (
    <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
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

      <button
        type="submit"
        disabled={!canSubmit}
        className={`signup-form__submit ${PRIMARY_CTA}`}
      >
        가입하기
      </button>
    </form>
  );
}
