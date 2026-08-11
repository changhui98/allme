import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import SignupFlow from "@/components/auth/SignupFlow";

export const metadata: Metadata = {
  title: "회원가입 | 올미",
  description:
    "올미에 가입하고 청소·인테리어·웹제작 등 필요한 서비스를 예약부터 결제까지 한번에 해결하세요.",
};

/**
 * 회원가입 페이지. (서버 컴포넌트)
 * 스텝 1 본인인증(포트원 통합인증) → 스텝 2 정보 입력. 모바일 redirect 방식은
 * 인증 후 이 페이지 쿼리로 복귀하므로 searchParams를 읽어 SignupFlow에 넘긴다.
 * 가입 제출·소셜 OAuth 연동은 백엔드 user 도메인 구현 후 붙인다.
 * 계정 1개=다중 역할 원칙에 따라 업체 여부는 여기서 받지 않는다(가입 후 역할 전환).
 */
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const identityVerificationId =
    typeof params.identityVerificationId === "string"
      ? params.identityVerificationId
      : undefined;
  const failMessage =
    typeof params.message === "string"
      ? params.message
      : "본인인증에 실패했습니다. 다시 시도해주세요.";
  const initialError =
    typeof params.code === "string" ? failMessage : undefined;

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
      <SignupFlow
        initialVerificationId={initialError ? undefined : identityVerificationId}
        initialError={initialError}
      />
    </AuthShell>
  );
}
