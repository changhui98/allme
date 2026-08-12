"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

/** 서버/최초 클라 렌더에선 false, 하이드레이션 이후 true. (setState-in-effect 없이 마운트 감지) */
function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * 라이트 ↔ 다크 전환 버튼.
 * 서버/클라 하이드레이션 불일치를 피하려고 마운트 전엔 빈 자리(placeholder)만 렌더한다.
 */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHydrated();

  const isDark = resolvedTheme === "dark";

  // 공용 아이콘 버튼 블록 (styles/components/button.css) — MobileNav 햄버거와 동일
  const buttonClass = "icon-btn";

  // 마운트 전: 레이아웃 흔들림 방지용 동일 크기 placeholder
  if (!mounted) {
    return <span className={buttonClass} aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className={buttonClass}
    >
      {isDark ? (
        // 해 아이콘 (라이트로 전환)
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        // 달 아이콘 (다크로 전환)
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
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
