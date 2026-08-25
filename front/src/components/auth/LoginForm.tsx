"use client";

import { useState, type FormEvent } from "react";
import FormField from "@/components/auth/FormField";
import { PRIMARY_CTA } from "@/lib/button-styles";
import { safeRedirectPath } from "@/lib/login-redirect";
import { loginUser } from "@/lib/user";

/**
 * 아이디 로그인 폼. (로그인 페이지는 metadata 때문에 서버 컴포넌트로 유지하고 폼만 분리)
 * POST /api/users/login — 성공 시 세션 쿠키가 심어지고 복귀 경로(redirectTo, 기본 홈)로 이동한다.
 * 실패 메시지는 서버가 사유 구분 없이 U010 하나로 내려준다(계정 존재 노출 방지).
 * 스타일: styles/pages/auth.css
 */
export default function LoginForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = loginId !== "" && password !== "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await loginUser(loginId, password);
      // router.push 대신 풀 리로드 — 헤더의 세션 확인(useMe) 캐시를 초기화해
      // 로그인 직후 마이페이지·설정 아이콘이 바로 반영되게 한다.
      // 페이지가 이미 검증한 값이지만 방어적으로 한 번 더 같은 오리진 경로만 허용
      window.location.assign(safeRedirectPath(redirectTo));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "로그인에 실패했습니다.",
      );
      setSubmitting(false);
    }
  };

  return (
    <form className="login-page__form" onSubmit={handleSubmit}>
      <FormField
        id="login-id"
        label="아이디"
        type="text"
        autoComplete="username"
        value={loginId}
        onChange={setLoginId}
      />
      <FormField
        id="password"
        label="비밀번호"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
      />

      {error ? (
        <p className="login-page__error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className={`login-page__submit ${PRIMARY_CTA}`}
      >
        {submitting ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
