"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AUTH_LINKS, BOARD_LINKS, MEMBER_LINKS } from "./nav-items";
import ThemeMenu from "@/components/theme/ThemeMenu";
import { useMe } from "@/lib/use-me";

/**
 * 모바일(<md) 전용 네비. 햄버거 버튼으로 주요 메뉴/검색/로그인 패널을 토글한다.
 * 스타일: styles/components/mobile-nav.css (버튼은 공용 .icon-btn)
 * 상태가 필요한 부분만 클라이언트 컴포넌트로 분리해 Header는 서버 컴포넌트로 유지한다.
 * 패널의 absolute 배치는 부모 .header가 sticky(포지셔닝 컨텍스트)인 것에 의존한다.
 */
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { me } = useMe();

  // ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
        className="icon-btn"
      >
        {open ? (
          // X 아이콘
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          // 햄버거 아이콘
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open && (
        <div id="mobile-nav-panel" className="mobile-nav__panel">
          {/* 검색 */}
          <form
            role="search"
            className="mobile-nav__search"
            onSubmit={(e) => e.preventDefault()}
          >
            <SearchIcon />
            <input
              type="search"
              name="q"
              placeholder="어떤 서비스를 찾으세요?"
              className="mobile-nav__search-input"
            />
          </form>

          {/* 주요 메뉴 */}
          <nav aria-label="주요 메뉴" className="mobile-nav__menu">
            <ul className="mobile-nav__list">
              {BOARD_LINKS.map((c) => (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    onClick={() => setOpen(false)}
                    className="mobile-nav__link"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 테마 메뉴 + 인증 영역 (로그인 상태면 마이페이지·설정) */}
          <div className="mobile-nav__footer">
            <ThemeMenu />
            {me ? (
              <>
                <Link
                  href={MEMBER_LINKS.mypage.href}
                  onClick={() => setOpen(false)}
                  className="mobile-nav__login"
                >
                  {MEMBER_LINKS.mypage.label}
                </Link>
                <Link
                  href={MEMBER_LINKS.settings.href}
                  onClick={() => setOpen(false)}
                  className="mobile-nav__signup"
                >
                  {MEMBER_LINKS.settings.label}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={AUTH_LINKS.login.href}
                  onClick={() => setOpen(false)}
                  className="mobile-nav__login"
                >
                  {AUTH_LINKS.login.label}
                </Link>
                <Link
                  href={AUTH_LINKS.signup.href}
                  onClick={() => setOpen(false)}
                  className="mobile-nav__signup"
                >
                  {AUTH_LINKS.signup.label}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="mobile-nav__search-icon"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
