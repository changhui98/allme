import Link from "next/link";
import { AUTH_LINKS, BOARD_LINKS } from "./nav-items";
import MobileNav from "./MobileNav";
import ThemeToggle from "@/components/theme/ThemeToggle";

/**
 * 모든 페이지 공통 헤더 (서버 컴포넌트). 스타일: styles/components/header.css
 * 구성: 로고 / 주요 메뉴(해드려요·해주세요) / 검색 / 로그인·회원가입.
 * 모바일에서는 네비·검색·로그인을 MobileNav(햄버거)로 접는다.
 */
export default function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        {/* 로고 */}
        <Link href="/" className="header__logo" aria-label="올미 홈">
          올미
        </Link>

        {/* 주요 메뉴 (데스크탑) */}
        <nav aria-label="주요 메뉴" className="header__nav">
          <ul className="header__menu">
            {BOARD_LINKS.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="header__menu-link">
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
          className="header__search"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="header__search-icon"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            name="q"
            placeholder="어떤 서비스를 찾으세요?"
            className="header__search-input"
          />
        </form>

        {/* 테마 토글 + 로그인/회원가입 (데스크탑) */}
        <div className="header__actions">
          <ThemeToggle />
          <Link href={AUTH_LINKS.login.href} className="header__login">
            {AUTH_LINKS.login.label}
          </Link>
          <Link href={AUTH_LINKS.signup.href} className="header__signup">
            {AUTH_LINKS.signup.label}
          </Link>
        </div>

        {/* 모바일 햄버거 (md 미만) */}
        <div className="header__mobile">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
