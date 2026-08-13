import Link from "next/link";
import type { ReactNode } from "react";
import AuthHeading from "@/components/auth/AuthHeading";

/**
 * 로그인·회원가입 페이지 공용 셸. (서버 컴포넌트)
 * 화면 중앙 정렬은 (auth)/layout.tsx 몫이고, 여기는 폼 컬럼(폭 제한)만 담당한다.
 * 로고는 모바일 전용 — 데스크톱은 좌측 BrandPanel 로고가 대신한다.
 * title/description을 생략하면 제목 영역 없이 본문만 렌더한다
 * (회원가입은 SignupFlow가 스텝별 제목을 직접 그린다).
 * 스타일: styles/pages/auth.css
 */
type AuthShellProps = {
  title?: string;
  /** 제목 아래 한 줄 안내 문구 */
  description?: string;
  children: ReactNode;
  /** 최하단 보조 링크 영역 (상호 링크, 비밀번호 찾기 등) */
  footer: ReactNode;
};

export default function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="auth-shell">
      <Link href="/" className="auth-shell__logo" aria-label="올미 홈">
        올미
      </Link>

      {title && description && (
        <div className="auth-shell__heading">
          <AuthHeading title={title} description={description} />
        </div>
      )}

      <div className="auth-shell__body">{children}</div>

      <div className="auth-shell__footer">{footer}</div>
    </main>
  );
}
