"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AUTH_LINKS, CATEGORIES } from "./nav-items";
import ThemeToggle from "@/components/theme/ThemeToggle";

/**
 * 모바일(<md) 전용 네비. 햄버거 버튼으로 카테고리/검색/로그인 패널을 토글한다.
 * 상태가 필요한 부분만 클라이언트 컴포넌트로 분리해 Header는 서버 컴포넌트로 유지한다.
 */
export default function MobileNav() {
  const [open, setOpen] = useState(false);

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
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-700 hover:bg-stone-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
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
        <div
          id="mobile-nav-panel"
          className="absolute inset-x-0 top-full border-b border-stone-200 bg-[var(--background)] px-4 py-4 shadow-sm dark:border-zinc-800"
        >
          {/* 검색 */}
          <form
            role="search"
            className="flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 dark:border-zinc-700"
            onSubmit={(e) => e.preventDefault()}
          >
            <SearchIcon />
            <input
              type="search"
              name="q"
              placeholder="어떤 서비스를 찾으세요?"
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
          </form>

          {/* 카테고리 */}
          <nav aria-label="카테고리" className="mt-4">
            <ul className="flex flex-col">
              {CATEGORIES.map((c) => (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-2 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 테마 토글 + 로그인/회원가입 */}
          <div className="mt-4 flex items-center gap-2 border-t border-stone-200 pt-4 dark:border-zinc-800">
            <ThemeToggle />
            <Link
              href={AUTH_LINKS.login.href}
              onClick={() => setOpen(false)}
              className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-center text-sm font-medium text-stone-700 hover:bg-stone-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {AUTH_LINKS.login.label}
            </Link>
            <Link
              href={AUTH_LINKS.signup.href}
              onClick={() => setOpen(false)}
              className="flex-1 rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {AUTH_LINKS.signup.label}
            </Link>
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
      className="shrink-0 text-stone-400"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
