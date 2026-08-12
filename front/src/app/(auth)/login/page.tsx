import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import FormField from "@/components/auth/FormField";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import { PRIMARY_CTA } from "@/lib/button-styles";

export const metadata: Metadata = {
  title: "로그인 | 올미",
  description:
    "올미 계정으로 로그인하고 서비스 탐색부터 예약·결제까지 한곳에서 이용하세요.",
};

/**
 * 로그인 페이지. (서버 컴포넌트)
 * 아직 UI 레이아웃 단계 — 아이디 로그인 제출과 소셜 OAuth 연동은
 * 백엔드 user 도메인 구현 후 붙인다. /forgot-password는 계획된 경로 플레이스홀더.
 */
export default function LoginPage() {
  return (
    <AuthShell
      title="로그인"
      description="올미에 오신 것을 환영해요."
      footer={
        <nav
          aria-label="계정 보조 링크"
          className="flex items-center justify-center gap-3"
        >
          <Link href="/forgot-password" className="hover:text-foreground">
            비밀번호 찾기
          </Link>
          <span aria-hidden="true" className="h-3 w-px bg-border" />
          <Link href="/signup" className="hover:text-foreground">
            회원가입
          </Link>
        </nav>
      }
    >
      <form className="flex flex-col gap-2">
        <FormField
          id="login-id"
          label="아이디"
          type="text"
          autoComplete="username"
        />
        <FormField
          id="password"
          label="비밀번호"
          type="password"
          autoComplete="current-password"
        />
        <button type="submit" className={`mt-8 ${PRIMARY_CTA}`}>
          로그인
        </button>
      </form>

      <SocialLoginButtons variant="login" />
    </AuthShell>
  );
}
