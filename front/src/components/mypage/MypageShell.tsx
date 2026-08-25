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
import { displayName, hasRole, logoutAndGoHome } from "@/lib/user";

/**
 * 모드별 메뉴 — 개인(/mypage/*)과 업체(/mypage/biz/*)를 URL로 분리하고
 * 사이드바·모바일 패널은 현재 모드의 메뉴 한 벌만 렌더한다(활성 판정은 정확 일치 유지).
 * 업체 모드 접근 가드는 biz/layout.tsx의 RoleGuard가 담당하므로 항목별 role 필터는 없다.
 */
const PERSONAL_MENU_ITEMS = [
  { href: "/mypage", label: "대시보드" },
  { href: "/mypage/requests", label: "요청한 서비스" },
  { href: "/mypage/profile", label: "내 정보" },
];

const BIZ_MENU_ITEMS = [
  { href: "/mypage/biz", label: "업체 대시보드" },
  { href: "/mypage/biz/services", label: "내 서비스" },
  { href: "/mypage/biz/received", label: "받은 요청" },
  { href: "/mypage/biz/profile", label: "업체 정보" },
];

/**
 * 마이페이지 전용 셸 — 공용 Header/Footer 없이 상단 바 + 사이드바 + 본문.
 * 개인(/mypage/*)·업체(/mypage/biz/*) 모드를 URL 프리픽스로 판정해 메뉴를 갈아끼우고,
 * 사이드바 상단에 프로필 통합형 전환 UI(아바타·모드 뱃지·전환 행)를 둔다(PROVIDER만).
 * 상단 바는 메인 헤더와 높이(4rem)·로고 위치를 맞춘다.
 * 데스크톱: 좌측 고정 사이드바(하단에 회원탈퇴·로그아웃) /
 * 모바일: 우측 햄버거 → 위에서 아래로 펼쳐지는 패널(메인 MobileNav와 같은 방식,
 * 프로필 → 메뉴 → 하단 로그아웃 구성).
 * 세션 가드: 비로그인이면 /login?redirect=<현재 경로>로 보낸다(공용 미들웨어 도입 전 페이지 단위 가드).
 * 스타일: styles/pages/mypage.css
 */
export default function MypageShell({ children }: { children: ReactNode }) {
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

  // ESC·바깥 클릭으로 모바일 패널 닫기 — 버튼·패널에 공통 래퍼가 없어 ref 2개로 스코프
  useOutsideClose(menuOpen, () => setMenuOpen(false), [
    menuBtnRef,
    menuPanelRef,
  ]);

  // 세션 확인 중이거나 리다이렉트 대기 — 빈 화면 유지
  if (!me) {
    return <div className="mypage-shell mypage-shell--pending" />;
  }

  const isBizMode =
    pathname === "/mypage/biz" || pathname.startsWith("/mypage/biz/");

  /**
   * 프로필 통합형 모드 전환 — 아바타·이름·현재 모드 뱃지("개인"/"업체") + 전환 행.
   * PROVIDER가 아니면 렌더하지 않는다(업체 모드 진입 자체가 PROVIDER 전제 — RoleGuard).
   */
  const isProvider = hasRole(me, "PROVIDER");

  const modeBadge = isProvider ? (
    <span
      className={`mypage-mode__badge${
        isBizMode ? " mypage-mode__badge--biz" : ""
      }`}
    >
      {isBizMode ? "업체" : "개인"}
    </span>
  ) : null;

  const renderModeSwitchRow = (onNavigate?: () => void) =>
    isProvider ? (
      <Link
        href={isBizMode ? "/mypage" : "/mypage/biz"}
        onClick={onNavigate}
        className="mypage-mode__switch"
      >
        <span className="mypage-mode__switch-icon">
          {isBizMode ? <PersonIcon /> : <StoreIcon />}
        </span>
        {isBizMode ? "개인 모드로 전환" : "업체 모드로 전환"}
        <span className="mypage-mode__chevron">
          <ChevronRightIcon />
        </span>
      </Link>
    ) : null;

  const menuItems = isBizMode ? BIZ_MENU_ITEMS : PERSONAL_MENU_ITEMS;

  const renderMenuLinks = (onNavigate?: () => void) =>
    menuItems.map((item) => {
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
              <Avatar name={displayName(me)} imageUrl={me.profileImageUrl} size="md" />
              <span className="mypage-menu-panel__who">
                <span className="mypage-menu-panel__name">{displayName(me)}</span>
                {modeBadge}
              </span>
            </Link>

            {/* 프로필 영역 아래 모드 전환 행 — 데스크톱 사이드바와 동일 (PROVIDER만) */}
            {isProvider && (
              <div className="mypage-menu-panel__mode">
                {renderModeSwitchRow(() => setMenuOpen(false))}
              </div>
            )}

            <nav aria-label="마이페이지 메뉴" className="mypage-menu-panel__nav">
              <ul className="mypage-sidebar__list">
                {renderMenuLinks(() => setMenuOpen(false))}
                {/* 회원탈퇴는 계정 단위 작업이라 개인 모드에서만 노출 */}
                {!isBizMode && (
                  <li className="mypage-sidebar__item">
                    <Link
                      href="/mypage/withdraw"
                      onClick={() => setMenuOpen(false)}
                      className="mypage-sidebar__link mypage-sidebar__link--danger"
                    >
                      회원탈퇴
                    </Link>
                  </li>
                )}
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
        {/* 데스크톱 사이드바 — 상단 프로필·모드 전환(PROVIDER만), 하단에 로그아웃(·개인 모드 한정 회원탈퇴) */}
        <nav aria-label="마이페이지 메뉴" className="mypage-sidebar">
          {isProvider && (
            <div className="mypage-mode">
              <div className="mypage-mode__profile">
                <Avatar name={displayName(me)} imageUrl={me.profileImageUrl} size="md" />
                <span className="mypage-mode__who">
                  <span className="mypage-mode__name">{displayName(me)}</span>
                  {modeBadge}
                </span>
              </div>
              {renderModeSwitchRow()}
            </div>
          )}
          <ul className="mypage-sidebar__list">{renderMenuLinks()}</ul>
          <div className="mypage-sidebar__footer">
            <button
              type="button"
              onClick={logoutAndGoHome}
              className="mypage-sidebar__footer-link"
            >
              로그아웃
            </button>
            {!isBizMode && (
              <Link
                href="/mypage/withdraw"
                className="mypage-sidebar__footer-link mypage-sidebar__footer-link--danger"
              >
                회원탈퇴
              </Link>
            )}
          </div>
        </nav>

        <main className="mypage-shell__main">{children}</main>
      </div>
    </div>
  );
}

function StoreIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 9.5 5.5 4h13L20 9.5" />
      <path d="M5 11v9h14v-9" />
      <path d="M9.5 20v-5.5h5V20" />
      <path d="M4 9.5h16" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20c1.4-3.4 4.3-5 7.5-5s6.1 1.6 7.5 5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
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
