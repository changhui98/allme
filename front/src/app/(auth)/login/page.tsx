import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

export const metadata: Metadata = {
  title: "로그인",
  description:
    "올미 계정으로 로그인하고 서비스 탐색부터 예약·결제까지 한곳에서 이용하세요.",
};

/**
 * 로그인 페이지. (서버 컴포넌트 — metadata 유지, 폼은 LoginForm으로 분리)
 * 소셜 OAuth 연동은 백엔드 구현 후 붙인다. /forgot-password는 계획된 경로 플레이스홀더.
 * 스타일: styles/pages/auth.css
 */
export default function LoginPage() {
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
      <LoginForm />

      <SocialLoginButtons variant="login" />
    </AuthShell>
  );
}
