"use client";

import Link from "next/link";
import { AUTH_LINKS, MEMBER_LINKS } from "./nav-items";
import { useMe } from "@/lib/use-me";

/**
 * 헤더 우측 인증 영역 (데스크톱). 세션 확인(/me) 결과에 따라
 * 비로그인: 로그인·회원가입 텍스트 링크 / 로그인: 마이페이지·설정 아이콘.
 * 확인 중에는 아무것도 그리지 않아 "로그인 → 아이콘" 깜빡임을 피한다.
 * 상태가 필요한 부분만 분리해 Header는 서버 컴포넌트로 유지한다.
 * 스타일: styles/components/header.css
 */
export default function HeaderAuth() {
  const { status, me } = useMe();

  if (status === "loading") return null;

  if (!me) {
    return (
      <>
        <Link href={AUTH_LINKS.login.href} className="header__login">
          {AUTH_LINKS.login.label}
        </Link>
        <Link href={AUTH_LINKS.signup.href} className="header__signup">
          {AUTH_LINKS.signup.label}
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href={MEMBER_LINKS.mypage.href}
        aria-label={MEMBER_LINKS.mypage.label}
        title={MEMBER_LINKS.mypage.label}
        className="icon-btn"
      >
        <UserIcon />
      </Link>
      <Link
        href={MEMBER_LINKS.settings.href}
        aria-label={MEMBER_LINKS.settings.label}
        title={MEMBER_LINKS.settings.label}
        className="icon-btn"
      >
        <SettingsIcon />
      </Link>
    </>
  );
}

export function UserIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
