import Link from "next/link";
import { AUTH_LINKS, BOARD_LINKS } from "./nav-items";
import MobileNav from "./MobileNav";
import ThemeToggle from "@/components/theme/ThemeToggle";

/**
 * 모든 페이지 공통 헤더 (서버 컴포넌트).
 * 구성: 로고 / 주요 메뉴(해드려요·해주세요) / 검색 / 로그인·회원가입.
 * 모바일에서는 네비·검색·로그인을 MobileNav(햄버거)로 접는다.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-[var(--background)]/95 backdrop-blur dark:border-stone-800">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        {/* 로고 */}
        <Link
          href="/"
          className="shrink-0 text-xl font-bold tracking-tight"
          aria-label="올미 홈"
        >
          올미
        </Link>

        {/* 주요 메뉴 (데스크탑) */}
        <nav aria-label="주요 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {BOARD_LINKS.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 검색 (데스크탑) */}
        <form
          role="search"
          action="/services"
          method="get"
          className="ml-auto hidden max-w-xs flex-1 items-center gap-2 rounded-md border border-stone-300 px-3 py-2 md:flex dark:border-stone-700"
        >
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
          <input
            type="search"
            name="q"
            placeholder="어떤 서비스를 찾으세요?"
            className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
          />
        </form>

        {/* 테마 토글 + 로그인/회원가입 (데스크탑) */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link
            href={AUTH_LINKS.login.href}
            className="rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            {AUTH_LINKS.login.label}
          </Link>
          <Link
            href={AUTH_LINKS.signup.href}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            {AUTH_LINKS.signup.label}
          </Link>
        </div>

        {/* 모바일 햄버거 (md 미만) — ml-auto로 우측 정렬 */}
        <div className="ml-auto md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
