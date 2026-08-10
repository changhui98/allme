import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import FormField from "@/components/auth/FormField";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

export const metadata: Metadata = {
  title: "회원가입 | 올미",
  description:
    "올미에 가입하고 청소·인테리어·웹제작 등 필요한 서비스를 예약부터 결제까지 한번에 해결하세요.",
};

/**
 * 회원가입 페이지. (서버 컴포넌트)
 * 아직 UI 레이아웃 단계 — 가입 제출·소셜 OAuth 연동은 백엔드 user 도메인 구현 후 붙인다.
 * 계정 1개=다중 역할 원칙에 따라 업체 여부는 여기서 받지 않는다(가입 후 역할 전환).
 */
export default function SignupPage() {
  return (
    <AuthShell
      title="회원가입"
      description="1분이면 올미의 모든 서비스를 이용할 수 있어요."
      footer={
        <>
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            로그인
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-2">
        <FormField id="name" label="이름" type="text" autoComplete="name" />
        <FormField id="email" label="이메일" type="email" autoComplete="email" />
        <FormField
          id="password"
          label="비밀번호 (8자 이상)"
          type="password"
          autoComplete="new-password"
        />
        <FormField
          id="password-confirm"
          label="비밀번호 확인"
          type="password"
          autoComplete="new-password"
        />

        <label className="mt-6 flex items-start gap-2 text-sm text-stone-500 dark:text-stone-400">
          <input
            type="checkbox"
            name="agree"
            className="mt-0.5 accent-primary"
          />
          <span>
            <Link href="/terms" className="underline hover:text-foreground">
              이용약관
            </Link>{" "}
            및{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              개인정보처리방침
            </Link>
            에 동의합니다
          </span>
        </label>

        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-primary py-3 text-[15px] font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          가입하기
        </button>
      </form>

      <SocialLoginButtons variant="signup" />
    </AuthShell>
  );
}
