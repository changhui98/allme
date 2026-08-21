"use client";

import Link from "next/link";
import { AUTH_LINKS, MEMBER_LINKS } from "./nav-items";
import { useMe } from "@/lib/use-me";
import { hasRole, logoutAndGoHome } from "@/lib/user";

/**
 * 헤더 우측 인증 영역 (데스크톱). 세션 확인(/me) 결과에 따라
 * 비로그인: 로그인·회원가입 텍스트 링크 / 로그인: 마이페이지·로그아웃 아이콘.
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
      {/* 운영 스태프(MANAGER/ADMIN)에게만 노출 — 실질 보호는 /admin 가드·백엔드 인가 */}
      {(hasRole(me, "MANAGER") || hasRole(me, "ADMIN")) && (
        <Link href="/admin" className="header__login">
          관리자
        </Link>
      )}
      <Link
        href={MEMBER_LINKS.mypage.href}
        aria-label={MEMBER_LINKS.mypage.label}
        title={MEMBER_LINKS.mypage.label}
        className="icon-btn"
      >
        <UserIcon />
      </Link>
      <button
        type="button"
        aria-label="로그아웃"
        title="로그아웃"
        onClick={logoutAndGoHome}
        className="icon-btn"
      >
        <LogoutIcon />
      </button>
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

export function LogoutIcon() {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
