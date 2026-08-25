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
  BuildingsIcon,
  CaseIcon,
  ClipboardListIcon,
  HamburgerIcon,
  HomeIcon,
  InboxIcon,
  LogoutIcon,
  ShopIcon,
  UserCrossIcon,
  UserIcon,
  WidgetIcon,
} from "@/components/icons/SolarIcons";
import Avatar from "@/components/mypage/Avatar";
import ThemeMenu from "@/components/theme/ThemeMenu";
import { currentPath, loginHref } from "@/lib/login-redirect";
import { useMe } from "@/lib/use-me";
import { DESKTOP_MEDIA_QUERY, useMediaQuery } from "@/lib/use-media";
import { useOutsideClose } from "@/lib/use-outside-close";
import { useSessionRevalidation } from "@/lib/use-session-revalidation";
import { useSidebarCollapsed } from "@/lib/use-sidebar-collapsed";
import { displayName, hasRole, logoutAndGoHome } from "@/lib/user";

type MenuItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
};

/**
 * 모드별 메뉴 — 개인(/mypage/*)과 업체(/mypage/biz/*)를 URL로 분리하고
 * 사이드바·모바일 패널은 현재 모드의 메뉴 한 벌만 렌더한다(활성 판정은 정확 일치 유지).
 * 업체 모드 접근 가드는 biz/layout.tsx의 RoleGuard가 담당하므로 항목별 role 필터는 없다.
 * 아이콘은 레일(접힌 사이드바)에서 라벨을 대신하므로 항목마다 필수.
 */
const PERSONAL_MENU_ITEMS: MenuItem[] = [
  { href: "/mypage", label: "대시보드", icon: WidgetIcon },
  { href: "/mypage/requests", label: "요청한 서비스", icon: ClipboardListIcon },
  { href: "/mypage/profile", label: "내 정보", icon: UserIcon },
];

const BIZ_MENU_ITEMS: MenuItem[] = [
  { href: "/mypage/biz", label: "업체 대시보드", icon: ShopIcon },
  { href: "/mypage/biz/services", label: "내 서비스", icon: CaseIcon },
  { href: "/mypage/biz/received", label: "받은 요청", icon: InboxIcon },
  { href: "/mypage/biz/profile", label: "업체 정보", icon: BuildingsIcon },
];

/**
 * 마이페이지 전용 셸 — 공용 Header/Footer 없이 상단 바 + 사이드바 + 본문.
 * 개인(/mypage/*)·업체(/mypage/biz/*) 모드를 URL 프리픽스로 판정해 메뉴를 갈아끼우고,
 * 사이드바 상단에 세로형 프로필(아바타 위·닉네임 아래, PROVIDER는 모드 뱃지·전환 행 추가)을 둔다.
 * 상단 바는 [햄버거][로고] … [화면 설정][홈] — 메인 헤더와 높이(4rem)를 맞춘다.
 * 햄버거 하나가 두 역할: 데스크톱(≥48rem)은 사이드바를 아이콘 레일로 접고 펼치며(localStorage 기억),
 * 모바일은 위에서 아래로 펼쳐지는 패널을 연다(메인 MobileNav와 같은 방식).
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
  const isProvider = hasRole(me, "PROVIDER");
  // 레일(아이콘만) 상태 — 데스크톱에서 접혔을 때만. 라벨 대신 title 툴팁을 단다
  const isRail = isDesktop && collapsed;

  const modeBadge = isProvider ? (
    <span
      className={`mypage-mode__badge${
        isBizMode ? " mypage-mode__badge--biz" : ""
      }`}
    >
      {isBizMode ? "업체" : "개인"}
    </span>
  ) : null;

  const renderModeSwitchRow = (onNavigate?: () => void) => {
    if (!isProvider) return null;
    const label = isBizMode ? "개인 모드로 전환" : "업체 모드로 전환";
    return (
      <Link
        href={isBizMode ? "/mypage" : "/mypage/biz"}
        onClick={onNavigate}
        title={isRail ? label : undefined}
        className="mypage-mode__switch"
      >
        <span className="mypage-mode__switch-icon">
          {isBizMode ? <UserIcon size={18} /> : <ShopIcon size={18} />}
        </span>
        <span className="mypage-mode__switch-label">{label}</span>
        <span className="mypage-mode__chevron">
          <ChevronRightIcon />
        </span>
      </Link>
    );
  };

  const menuItems = isBizMode ? BIZ_MENU_ITEMS : PERSONAL_MENU_ITEMS;

  const renderMenuLinks = (onNavigate?: () => void) =>
    menuItems.map((item) => {
      const isActive = pathname === item.href;
      const Icon = item.icon;
      return (
        <li key={item.href} className="mypage-sidebar__item">
          <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
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
        </li>
      );
    });

  // 회원탈퇴는 계정 단위 작업이라 개인 모드에서만 노출
  const renderWithdrawLink = (onNavigate?: () => void) =>
    !isBizMode ? (
      <li className="mypage-sidebar__item">
        <Link
          href="/mypage/withdraw"
          onClick={onNavigate}
          title={isRail ? "회원탈퇴" : undefined}
          className="mypage-sidebar__link mypage-sidebar__link--danger"
        >
          <span className="mypage-sidebar__icon">
            <UserCrossIcon />
          </span>
          <span className="mypage-sidebar__label">회원탈퇴</span>
        </Link>
      </li>
    ) : null;

  const handleMenuButton = () => {
    // 렌더 분기(isDesktop)와 같은 기준이지만 클릭 시점 값을 직접 읽는다
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
            aria-controls={isDesktop ? "mypage-sidebar" : "mypage-menu-panel"}
            onClick={handleMenuButton}
            className="icon-btn mypage-topbar__menu-btn"
          >
            {!isDesktop && menuOpen ? (
              <CloseIcon />
            ) : (
              <HamburgerIcon size={22} />
            )}
          </button>
          <Link href="/" className="mypage-topbar__logo" aria-label="올미 홈">
            올미
          </Link>
        </div>

        {/* 데스크톱: 화면 설정·홈 아이콘 (계정 표시는 사이드바 프로필이 담당) */}
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
                {renderWithdrawLink(() => setMenuOpen(false))}
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
        {/* 데스크톱 사이드바 — 상단 세로형 프로필(+PROVIDER 모드 전환), 메뉴, 하단 로그아웃(·개인 모드 한정 회원탈퇴).
            접히면(레일) 아이콘만 남고 라벨은 title 툴팁으로 대체 */}
        <nav id="mypage-sidebar" aria-label="마이페이지 메뉴" className="mypage-sidebar">
          <div className="mypage-mode">
            <Link
              href="/mypage/profile"
              title={isRail ? `${displayName(me)} — 내 정보` : undefined}
              className="mypage-mode__profile"
            >
              <Avatar name={displayName(me)} imageUrl={me.profileImageUrl} size="md" />
              <span className="mypage-mode__name">{displayName(me)}</span>
              {modeBadge}
            </Link>
            {renderModeSwitchRow()}
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
            {renderWithdrawLink()}
          </ul>
        </nav>

        <main className="mypage-shell__main">{children}</main>
      </div>
    </div>
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
