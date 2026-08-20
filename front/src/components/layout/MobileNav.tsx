"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { AUTH_LINKS, BOARD_LINKS, MEMBER_LINKS } from "./nav-items";
import Avatar from "@/components/mypage/Avatar";
import ThemeMenu from "@/components/theme/ThemeMenu";
import { useMe } from "@/lib/use-me";
import { useOutsideClose } from "@/lib/use-outside-close";
import { logoutAndGoHome } from "@/lib/user";

/**
 * 모바일(<md) 전용 네비. 햄버거 버튼으로 검색/메뉴 패널을 토글한다.
 * 레이아웃은 마이페이지 모바일 패널(mypage-menu-panel)과 동일 구성 —
 * 검색 → (로그인 시) 프로필 → 세로 메뉴 리스트 → 하단 플랫 링크(테마·마이페이지·로그아웃
 * / 비로그인은 테마·로그인·회원가입).
 * 스타일: styles/components/mobile-nav.css (버튼은 공용 .icon-btn)
 * 상태가 필요한 부분만 클라이언트 컴포넌트로 분리해 Header는 서버 컴포넌트로 유지한다.
 * 패널의 absolute 배치는 부모 .header가 sticky(포지셔닝 컨텍스트)인 것에 의존한다.
 */
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { me } = useMe();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);

  // ESC·바깥 클릭으로 닫기 (버튼+패널이 rootRef 안이라 토글 버튼 클릭은 outside가 아님)
  useOutsideClose(open, () => setOpen(false), [rootRef]);

  return (
    <div ref={rootRef} className="mobile-nav">
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

          {/* 프로필 — 마이페이지 패널과 같은 구성(아바타+이름+아이디) */}
          {me && (
            <Link
              href="/mypage/profile"
              onClick={() => setOpen(false)}
              className="mobile-nav__profile"
            >
              <Avatar name={me.name} imageUrl={me.profileImageUrl} size="md" />
              <span className="mobile-nav__profile-who">
                <span className="mobile-nav__profile-name">{me.name}</span>
                <span className="mobile-nav__profile-login-id">
                  {me.loginId}
                </span>
              </span>
            </Link>
          )}

          {/* 주요 메뉴 — 보고 있는 게시판은 활성 표시 */}
          <nav aria-label="주요 메뉴" className="mobile-nav__menu">
            <ul className="mobile-nav__list">
              {BOARD_LINKS.map((c) => {
                const isActive = pathname.startsWith(c.href);
                return (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`mobile-nav__link${
                        isActive ? " mobile-nav__link--active" : ""
                      }`}
                    >
                      {c.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 하단 — 테마 메뉴 + 마이페이지·로그아웃 (비로그인은 로그인·회원가입) */}
          <div className="mobile-nav__footer">
            <ThemeMenu />
            {me ? (
              <>
                <Link
                  href={MEMBER_LINKS.mypage.href}
                  onClick={() => setOpen(false)}
                  className="mobile-nav__footer-link"
                >
                  {MEMBER_LINKS.mypage.label}
                </Link>
                <button
                  type="button"
                  onClick={logoutAndGoHome}
                  className="mobile-nav__footer-link"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href={AUTH_LINKS.login.href}
                  onClick={() => setOpen(false)}
                  className="mobile-nav__footer-link"
                >
                  {AUTH_LINKS.login.label}
                </Link>
                <Link
                  href={AUTH_LINKS.signup.href}
                  onClick={() => setOpen(false)}
                  className="mobile-nav__footer-link"
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
