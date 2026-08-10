import Link from "next/link";
import type { ReactNode } from "react";

/**
 * 로그인·회원가입 페이지 공용 셸. (서버 컴포넌트)
 * 카드 박스 없이 페이지 배경 위에 바로 얹는 중앙 정렬 컬럼 —
 * 상단에 로고·제목·안내 문구, 본문에 폼, 하단에 보조 링크 영역을 담는다.
 */
type AuthShellProps = {
  title: string;
  /** 제목 아래 한 줄 안내 문구 */
  description: string;
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
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="block text-center text-3xl font-bold tracking-tight text-primary"
          aria-label="올미 홈"
        >
          올미
        </Link>
        <h1 className="mt-6 text-center text-xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="mt-1 text-center text-sm text-stone-500 dark:text-stone-400">
          {description}
        </p>

        <div className="mt-10">{children}</div>

        <div className="mt-8 text-center text-sm text-stone-500 dark:text-stone-400">
          {footer}
        </div>
      </div>
    </main>
  );
}
