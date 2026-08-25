"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Avatar from "@/components/mypage/Avatar";
import ThemeMenu from "@/components/theme/ThemeMenu";
import { currentPath, loginHref } from "@/lib/login-redirect";
import { useMe } from "@/lib/use-me";
import { useOutsideClose } from "@/lib/use-outside-close";
import { useSessionRevalidation } from "@/lib/use-session-revalidation";
import { displayName, logoutAndGoHome } from "@/lib/user";

/** 관리자 메뉴 — /admin만 정확 일치, 나머지는 프리픽스 일치(상세 페이지에서도 활성 유지) */
const MENU_ITEMS = [
  { href: "/admin", label: "대시보드", exact: true },
  { href: "/admin/applications", label: "업체 신청" },
  { href: "/admin/users", label: "회원" },
];

/**
 * 관리자 전용 셸 — MypageShell과 같은 골격(상단 바 + 사이드바 + 모바일 패널)이라
 * mypage-* 셸 클래스(styles/pages/mypage.css)를 재사용하고, 관리자 고유 스타일만
 * admin.css(admin-topbar__badge 등)에 둔다.
 * 비로그인 가드는 이 셸이, 역할 가드(MANAGER/ADMIN)는 (admin) layout의 RoleGuard가,
 * 실질 보호는 백엔드 /api/admin/** 인가가 담당한다.
 */
export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, me } = useMe();
  // API 호출 없는 페이지로 이동해도 세션 만료를 감지(전역 모달) — 셸은 리마운트되지 않으므로
  useSessionRevalidation(Boolean(me));
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "ready" && !me) {
      // 현재 경로를 붙여 보내 로그인 후 여기로 복귀시킨다
      router.replace(loginHref(currentPath()));
    }
  }, [status, me, router]);

  useOutsideClose(menuOpen, () => setMenuOpen(false), [
    menuBtnRef,
    menuPanelRef,
  ]);

  // 세션 확인 중이거나 리다이렉트 대기 — 빈 화면 유지
  if (!me) {
    return <div className="mypage-shell mypage-shell--pending" />;
  }

  const renderMenuLinks = (onNavigate?: () => void) =>
    MENU_ITEMS.map((item) => {
      const isActive = item.exact
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
        <span className="admin-topbar__brand">
          <Link href="/" className="mypage-topbar__logo" aria-label="올미 홈">
            올미
          </Link>
          <span className="admin-topbar__badge">관리자</span>
        </span>

        {/* 데스크톱: 아바타+아이디·테마·홈 아이콘 */}
        <div className="mypage-topbar__actions">
          <Link
            href="/mypage/profile"
            className="mypage-topbar__profile"
            aria-label="내 정보"
          >
            <Avatar name={displayName(me)} imageUrl={me.profileImageUrl} size="sm" />
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
          aria-controls="admin-menu-panel"
          onClick={() => setMenuOpen((v) => !v)}
          className="icon-btn mypage-topbar__menu-btn"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        {/* 모바일 드롭다운 패널 */}
        {menuOpen && (
          <div
            ref={menuPanelRef}
            id="admin-menu-panel"
            className="mypage-menu-panel"
          >
            <nav aria-label="관리자 메뉴" className="mypage-menu-panel__nav">
              <ul className="mypage-sidebar__list">
                {renderMenuLinks(() => setMenuOpen(false))}
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
        {/* 데스크톱 사이드바 — 하단에 로그아웃 */}
        <nav aria-label="관리자 메뉴" className="mypage-sidebar">
          <ul className="mypage-sidebar__list">{renderMenuLinks()}</ul>
          <div className="mypage-sidebar__footer">
            <button
              type="button"
              onClick={logoutAndGoHome}
              className="mypage-sidebar__footer-link"
            >
              로그아웃
            </button>
          </div>
        </nav>

        {/* admin-main이 마이페이지의 56rem 글줄 제한을 풀어 콘솔답게 화면을 채운다 */}
        <main className="mypage-shell__main admin-main">{children}</main>
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
