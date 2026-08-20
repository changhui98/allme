"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Avatar from "@/components/mypage/Avatar";
import ThemeMenu from "@/components/theme/ThemeMenu";
import { useMe } from "@/lib/use-me";
import { useOutsideClose } from "@/lib/use-outside-close";
import { hasRole, logoutAndGoHome, type UserRole } from "@/lib/user";

/**
 * 사이드바·모바일 패널 공용 메뉴 — 거래 루프 관리(사용자·업체 관점) + 내 정보.
 * role이 지정된 항목은 해당 역할 보유 시에만 노출된다(숨김은 UX용 — 실질 보호는 백엔드 인가).
 */
const MENU_ITEMS: { href: string; label: string; role?: UserRole }[] = [
  { href: "/mypage", label: "대시보드" },
  { href: "/mypage/requests", label: "요청한 서비스" },
  { href: "/mypage/received", label: "받은 요청", role: "PROVIDER" },
  { href: "/mypage/profile", label: "내 정보" },
];

/**
 * 마이페이지 전용 셸 — 공용 Header/Footer 없이 상단 바 + 사이드바 + 본문.
 * 상단 바는 메인 헤더와 높이(4rem)·로고 위치를 맞춘다.
 * 데스크톱: 좌측 고정 사이드바(하단에 회원탈퇴·로그아웃) /
 * 모바일: 우측 햄버거 → 위에서 아래로 펼쳐지는 패널(메인 MobileNav와 같은 방식,
 * 프로필 → 메뉴 → 하단 로그아웃 구성).
 * 세션 가드: 비로그인이면 /login으로 보낸다(공용 미들웨어 도입 전 페이지 단위 가드).
 * 스타일: styles/pages/mypage.css
 */
export default function MypageShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, me } = useMe();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "ready" && !me) {
      router.replace("/login");
    }
  }, [status, me, router]);

  // ESC·바깥 클릭으로 모바일 패널 닫기 — 버튼·패널에 공통 래퍼가 없어 ref 2개로 스코프
  useOutsideClose(menuOpen, () => setMenuOpen(false), [
    menuBtnRef,
    menuPanelRef,
  ]);

  // 세션 확인 중이거나 리다이렉트 대기 — 빈 화면 유지
  if (!me) {
    return <div className="mypage-shell mypage-shell--pending" />;
  }

  const renderMenuLinks = (onNavigate?: () => void) =>
    MENU_ITEMS.filter((item) => !item.role || hasRole(me, item.role)).map((item) => {
      const isActive = pathname === item.href;
      return (
        <li key={item.href} className="mypage-sidebar__item">
          <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`mypage-sidebar__link${
              isActive ? " mypage-sidebar__link--active" : ""
            }`}
          >
            {item.label}
          </Link>
        </li>
      );
    });

  return (
    <div className="mypage-shell">
      <header className="mypage-topbar">
        <Link href="/" className="mypage-topbar__logo" aria-label="올미 홈">
          올미
        </Link>

        {/* 데스크톱: 아바타+아이디·홈 아이콘 */}
        <div className="mypage-topbar__actions">
          <Link
            href="/mypage/profile"
            className="mypage-topbar__profile"
            aria-label="내 정보"
          >
            <Avatar name={me.name} imageUrl={me.profileImageUrl} size="sm" />
            <span className="mypage-topbar__login-id">{me.loginId}</span>
          </Link>
          <ThemeMenu />
          <Link
            href="/"
            className="mypage-topbar__home"
            aria-label="홈으로"
            title="홈으로"
          >
            <HomeIcon />
          </Link>
        </div>

        {/* 모바일: 햄버거 토글 */}
        <button
          ref={menuBtnRef}
          type="button"
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={menuOpen}
          aria-controls="mypage-menu-panel"
          onClick={() => setMenuOpen((v) => !v)}
          className="icon-btn mypage-topbar__menu-btn"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        {/* 모바일 드롭다운 패널 — 상단 바 아래로 펼쳐진다 */}
        {menuOpen && (
          <div
            ref={menuPanelRef}
            id="mypage-menu-panel"
            className="mypage-menu-panel"
          >
            <Link
              href="/mypage/profile"
              onClick={() => setMenuOpen(false)}
              className="mypage-menu-panel__profile"
            >
              <Avatar name={me.name} imageUrl={me.profileImageUrl} size="md" />
              <span className="mypage-menu-panel__who">
                <span className="mypage-menu-panel__name">{me.name}</span>
                <span className="mypage-menu-panel__login-id">
                  {me.loginId}
                </span>
              </span>
            </Link>

            <nav aria-label="마이페이지 메뉴" className="mypage-menu-panel__nav">
              <ul className="mypage-sidebar__list">
                {renderMenuLinks(() => setMenuOpen(false))}
                <li className="mypage-sidebar__item">
                  <Link
                    href="/mypage/withdraw"
                    onClick={() => setMenuOpen(false)}
                    className="mypage-sidebar__link mypage-sidebar__link--danger"
                  >
                    회원탈퇴
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="mypage-menu-panel__footer">
              <ThemeMenu />
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="mypage-menu-panel__footer-link"
              >
                홈으로
              </Link>
              <button
                type="button"
                onClick={logoutAndGoHome}
                className="mypage-menu-panel__footer-link"
              >
                로그아웃
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="mypage-shell__body">
        {/* 데스크톱 사이드바 — 하단에 회원탈퇴·로그아웃 */}
        <nav aria-label="마이페이지 메뉴" className="mypage-sidebar">
          <ul className="mypage-sidebar__list">{renderMenuLinks()}</ul>
          <div className="mypage-sidebar__footer">
            <button
              type="button"
              onClick={logoutAndGoHome}
              className="mypage-sidebar__footer-link"
            >
              로그아웃
            </button>
            <Link
              href="/mypage/withdraw"
              className="mypage-sidebar__footer-link mypage-sidebar__footer-link--danger"
            >
              회원탈퇴
            </Link>
          </div>
        </nav>

        <main className="mypage-shell__main">{children}</main>
      </div>
    </div>
  );
}

function HomeIcon() {
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
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h5v-6h4v6h5V9.5" />
    </svg>
  );
}

function MenuIcon() {
  return (
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
  );
}

function CloseIcon() {
  return (
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
  );
}
