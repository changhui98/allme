import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import { LOGIN_REDIRECT_PARAM, safeRedirectPath } from "@/lib/login-redirect";

export const metadata: Metadata = {
  title: "로그인",
  description:
    "올미 계정으로 로그인하고 서비스 탐색부터 예약·결제까지 한곳에서 이용하세요.",
};

/**
 * 로그인 페이지. (서버 컴포넌트 — metadata 유지, 폼은 LoginForm으로 분리)
 * `?redirect=` 쿼리(세션 만료 모달·셸 가드가 붙임)를 검증해 LoginForm에 넘긴다 —
 * searchParams 접근으로 동적 렌더링이 되지만 로그인 페이지라 무방.
 * 소셜 OAuth 연동은 백엔드 구현 후 붙인다. /forgot-password는 계획된 경로 플레이스홀더.
 * 스타일: styles/pages/auth.css
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const redirectTo = safeRedirectPath((await searchParams)[LOGIN_REDIRECT_PARAM]);
  return (
    <AuthShell
      title="로그인"
      description="올미에 오신 것을 환영해요."
      footer={
        <nav aria-label="계정 보조 링크" className="login-page__links">
          <Link href="/forgot-password" className="login-page__link">
            비밀번호 찾기
          </Link>
          <span aria-hidden="true" className="login-page__divider" />
          <Link href="/signup" className="login-page__link">
            회원가입
          </Link>
          <span aria-hidden="true" className="login-page__divider" />
          <Link href="/" className="login-page__link">
            홈으로
          </Link>
        </nav>
      }
    >
      <LoginForm redirectTo={redirectTo} />

      <SocialLoginButtons variant="login" />
    </AuthShell>
  );
}
