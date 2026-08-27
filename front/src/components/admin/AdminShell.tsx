"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  BellIcon,
  ClipboardCheckIcon,
  HamburgerIcon,
  HomeIcon,
  LogoutIcon,
  TuningIcon,
  UsersGroupIcon,
  WidgetGridIcon,
} from "@/components/icons/SolarIcons";
import Avatar from "@/components/mypage/Avatar";
import ShellConnectionError from "@/components/mypage/ShellConnectionError";
import ThemeMenu from "@/components/theme/ThemeMenu";
import { currentPath, loginHref } from "@/lib/login-redirect";
import { useMe } from "@/lib/use-me";
import { DESKTOP_MEDIA_QUERY, useMediaQuery } from "@/lib/use-media";
import { useOutsideClose } from "@/lib/use-outside-close";
import { useSessionRevalidation } from "@/lib/use-session-revalidation";
import { useSidebarCollapsed } from "@/lib/use-sidebar-collapsed";
import { displayName, logoutAndGoHome } from "@/lib/user";

type SubMenuItem = {
  href: string;
  label: string;
};

type MenuItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  exact?: boolean;
  /** 하위 메뉴가 있을 때 상위 활성 판정에 쓰는 경로 프리픽스(기본은 href) */
  activePrefix?: string;
  /** 하위 메뉴 — 항상 펼쳐 보이고(아코디언 없음) 레일 모드에선 숨긴다. 아이콘 없이 텍스트만. */
  children?: SubMenuItem[];
};

/**
 * 관리자 메뉴 — /admin만 정확 일치, 나머지는 프리픽스 일치(상세 페이지에서도 활성 유지).
 * 업체 관리(신청 심사·활동 업체)·서비스 관리(FAQ·문의사항)는 하위 메뉴를 가진 그룹 — 상위 링크는 첫 하위로 가고
 * 그룹 프리픽스(/admin/providers, /admin/service)로 활성 판정한다(그룹 루트 직접 진입은 next.config redirects가 첫 하위로 보낸다).
 */
const MENU_ITEMS: MenuItem[] = [
  { href: "/admin", label: "대시보드", icon: WidgetGridIcon, exact: true },
  {
    href: "/admin/providers/applications",
    label: "업체 관리",
    icon: ClipboardCheckIcon,
    activePrefix: "/admin/providers",
    children: [
      { href: "/admin/providers/applications", label: "신청 심사" },
      { href: "/admin/providers/active", label: "활동 업체" },
    ],
  },
  { href: "/admin/users", label: "회원", icon: UsersGroupIcon },
  { href: "/admin/notices", label: "공지사항", icon: BellIcon },
  {
    href: "/admin/service/faqs",
    label: "서비스 관리",
    icon: TuningIcon,
    activePrefix: "/admin/service",
    children: [
      { href: "/admin/service/faqs", label: "FAQ" },
      { href: "/admin/service/inquiries", label: "문의사항" },
    ],
  },
];

const isPathActive = (pathname: string, href: string, exact?: boolean) =>
  exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

/**
 * 관리자 전용 셸 — MypageShell과 같은 골격(상단 바 [햄버거][로고] + 사이드바(레일 토글) + 모바일 패널)이라
 * mypage-* 셸 클래스(styles/pages/mypage.css)를 재사용하고, 관리자 고유 스타일만
 * admin.css(admin-topbar__badge 등)에 둔다. 레일 상태는 마이페이지와 localStorage 키를 공유한다.
 * 비로그인 가드는 이 셸이, 역할 가드(MANAGER/ADMIN)는 (admin) layout의 RoleGuard가,
 * 연결 실패·5xx는 비로그인과 구분해 리다이렉트하지 않고 재시도 화면(ShellConnectionError)을 띄운다.
 * 실질 보호는 백엔드 /api/admin/** 인가가 담당한다.
 */
export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, me, retry } = useMe();
  // API 호출 없는 페이지로 이동해도 세션 만료를 감지(전역 모달) — 셸은 리마운트되지 않으므로
  useSessionRevalidation(Boolean(me));
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
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

  // /me 호출 자체가 실패(연결 불가·5xx) — 비로그인이 아니므로 리다이렉트 대신 재시도 화면
  if (status === "error") {
    return <ShellConnectionError onRetry={retry} />;
  }

  // 세션 확인 중이거나 리다이렉트 대기 — 빈 화면 유지
  if (!me) {
    return <div className="mypage-shell mypage-shell--pending" />;
  }

  const isRail = isDesktop && collapsed;

  const renderMenuLinks = (onNavigate?: () => void) =>
    MENU_ITEMS.map((item) => {
      const isActive = isPathActive(
        pathname,
        item.activePrefix ?? item.href,
        item.exact,
      );
      const Icon = item.icon;
      return (
        <li key={item.href} className="mypage-sidebar__item">
          <Link
            href={item.href}
            onClick={onNavigate}
            // 하위 메뉴가 있으면 정확한 현재 페이지는 하위 링크가 표시한다
            aria-current={isActive && !item.children ? "page" : undefined}
            title={isRail ? item.label : undefined}
            className={`mypage-sidebar__link${
              isActive ? " mypage-sidebar__link--active" : ""
            }`}
          >
            <span className="mypage-sidebar__icon">
              <Icon />
            </span>
            <span className="mypage-sidebar__label">{item.label}</span>
          </Link>
          {item.children && (
            <ul className="admin-sidebar__sublist">
              {item.children.map((child) => {
                const isChildActive = isPathActive(pathname, child.href);
                return (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      onClick={onNavigate}
                      aria-current={isChildActive ? "page" : undefined}
                      className={`admin-sidebar__sublink${
                        isChildActive ? " admin-sidebar__sublink--active" : ""
                      }`}
                    >
                      {child.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    });

  const handleMenuButton = () => {
    if (window.matchMedia(DESKTOP_MEDIA_QUERY).matches) toggleCollapsed();
    else setMenuOpen((v) => !v);
  };

  return (
    <div className={`mypage-shell${collapsed ? " mypage-shell--rail" : ""}`}>
      <header className="mypage-topbar">
        <div className="mypage-topbar__lead">
          {/* 햄버거 — 데스크톱: 사이드바 레일 토글 / 모바일: 드롭다운 패널 토글 */}
          <button
            ref={menuBtnRef}
            type="button"
            aria-label={
              isDesktop
                ? collapsed
                  ? "메뉴 펼치기"
                  : "메뉴 접기"
                : menuOpen
                  ? "메뉴 닫기"
                  : "메뉴 열기"
            }
            aria-expanded={isDesktop ? !collapsed : menuOpen}
            aria-controls={isDesktop ? "admin-sidebar" : "admin-menu-panel"}
            onClick={handleMenuButton}
            className="icon-btn mypage-topbar__menu-btn"
          >
            {!isDesktop && menuOpen ? (
              <CloseIcon />
            ) : (
              <HamburgerIcon size={22} />
            )}
          </button>
          <span className="admin-topbar__brand">
            <Link href="/" className="mypage-topbar__logo" aria-label="올미 홈">
              올미
            </Link>
            <span className="admin-topbar__badge">관리자</span>
          </span>
        </div>

        {/* 데스크톱: 화면 설정·홈 아이콘 */}
        <div className="mypage-topbar__actions">
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
        {/* 데스크톱 사이드바 — 상단 세로형 프로필(내 정보 링크), 메뉴, 하단 로그아웃 */}
        <nav id="admin-sidebar" aria-label="관리자 메뉴" className="mypage-sidebar">
          <div className="mypage-mode">
            <Link
              href="/mypage/profile"
              title={isRail ? `${displayName(me)} — 내 정보` : undefined}
              className="mypage-mode__profile"
            >
              <Avatar name={displayName(me)} imageUrl={me.profileImageUrl} size="md" />
              <span className="mypage-mode__name">{displayName(me)}</span>
            </Link>
          </div>
          <ul className="mypage-sidebar__list">{renderMenuLinks()}</ul>
          <ul className="mypage-sidebar__list mypage-sidebar__footer">
            <li className="mypage-sidebar__item">
              <button
                type="button"
                onClick={logoutAndGoHome}
                title={isRail ? "로그아웃" : undefined}
                className="mypage-sidebar__link"
              >
                <span className="mypage-sidebar__icon">
                  <LogoutIcon />
                </span>
                <span className="mypage-sidebar__label">로그아웃</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* admin-main: 관리자 콘솔 본문(표·목록이 넓어 풀폭 사용) */}
        <main className="mypage-shell__main admin-main">{children}</main>
      </div>
    </div>
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
