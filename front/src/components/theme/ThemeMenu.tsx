"use client";

import { useTheme } from "next-themes";
import { useRef, useState, useSyncExternalStore } from "react";
import { useOutsideClose } from "@/lib/use-outside-close";

/** 서버/최초 클라 렌더에선 false, 하이드레이션 이후 true. (setState-in-effect 없이 마운트 감지) */
function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

const ACCENT_STORAGE_KEY = "accent";
const DEFAULT_ACCENT = "terracotta";

/**
 * 컬러 테마 목록. 토큰 정의(tokens.css의 data-accent 블록)와 키가 1:1로 맞아야 한다.
 * light/dark는 스와치 미리보기용 primary 값 — 실제 적용 색은 tokens.css가 결정한다.
 */
const ACCENTS = [
  { key: "terracotta", label: "테라코타", light: "#d97757", dark: "#d97757" },
  { key: "teal", label: "틸", light: "#0d9488", dark: "#2dd4bf" },
  { key: "emerald", label: "에메랄드", light: "#16a34a", dark: "#4ade80" },
  { key: "blue", label: "블루", light: "#2563eb", dark: "#60a5fa" },
  { key: "indigo", label: "인디고", light: "#4f46e5", dark: "#818cf8" },
  { key: "violet", label: "바이올렛", light: "#7c3aed", dark: "#a78bfa" },
] as const;

const MODES = [
  { key: "system", label: "시스템" },
  { key: "light", label: "라이트" },
  { key: "dark", label: "다크" },
] as const;

/**
 * 테마 설정 드롭다운: 모드(시스템/라이트/다크) + 컬러 테마 스와치.
 * 모드는 next-themes(setTheme), 컬러는 <html data-accent> + localStorage로 관리한다.
 * 컬러는 하나를 고르면 라이트/다크 양쪽에 공통 적용된다(스와치만 현재 모드 색으로 표시).
 * 서버/클라 하이드레이션 불일치를 피하려고 마운트 전엔 빈 자리(placeholder)만 렌더한다.
 */
export default function ThemeMenu() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useHydrated();
  const [open, setOpen] = useState(false);
  // layout.tsx 인라인 스크립트가 첫 페인트 전에 붙여둔 data-accent를 초기값으로 읽는다
  // (서버 렌더에선 document가 없으므로 기본값 — 마운트 전엔 placeholder만 그려 불일치 없음)
  const [accent, setAccent] = useState(() =>
    typeof document === "undefined"
      ? DEFAULT_ACCENT
      : (document.documentElement.getAttribute("data-accent") ?? DEFAULT_ACCENT),
  );
  const rootRef = useRef<HTMLDivElement>(null);

  // ESC + 바깥 클릭으로 닫기
  useOutsideClose(open, () => setOpen(false), [rootRef]);

  const selectAccent = (key: string) => {
    setAccent(key);
    if (key === DEFAULT_ACCENT) {
      document.documentElement.removeAttribute("data-accent");
      localStorage.removeItem(ACCENT_STORAGE_KEY);
    } else {
      document.documentElement.setAttribute("data-accent", key);
      localStorage.setItem(ACCENT_STORAGE_KEY, key);
    }
  };

  // 마운트 전: 레이아웃 흔들림 방지용 동일 크기 placeholder
  if (!mounted) {
    return <span className="icon-btn" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div ref={rootRef} className="theme-menu">
      <button
        type="button"
        aria-label="테마 설정"
        aria-expanded={open}
        aria-controls="theme-menu-panel"
        onClick={() => setOpen((v) => !v)}
        className="icon-btn"
      >
        {/* 팔레트 아이콘 */}
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
          <path d="M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1-2-2 2 2 0 0 1 2-2h6a3 3 0 0 0 3-3c0-3.5-4-6-9-6z" />
          <circle cx="7.5" cy="11.5" r="0.5" fill="currentColor" />
          <circle cx="9" cy="7.5" r="0.5" fill="currentColor" />
          <circle cx="14" cy="6.5" r="0.5" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div id="theme-menu-panel" className="theme-menu__panel">
          <p className="theme-menu__title" id="theme-menu-mode-label">
            모드
          </p>
          <div
            role="radiogroup"
            aria-labelledby="theme-menu-mode-label"
            className="theme-menu__modes"
          >
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                role="radio"
                aria-checked={theme === m.key}
                onClick={() => setTheme(m.key)}
                className={`theme-menu__mode${theme === m.key ? " is-active" : ""}`}
              >
                <ModeIcon mode={m.key} />
                {m.label}
              </button>
            ))}
          </div>

          <hr className="theme-menu__divider" />

          <p className="theme-menu__title" id="theme-menu-accent-label">
            컬러 테마
          </p>
          <div
            role="radiogroup"
            aria-labelledby="theme-menu-accent-label"
            className="theme-menu__swatches"
          >
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                type="button"
                role="radio"
                aria-checked={accent === a.key}
                onClick={() => selectAccent(a.key)}
                className={`theme-menu__swatch${accent === a.key ? " is-active" : ""}`}
              >
                <span
                  className="theme-menu__swatch-dot"
                  style={{ backgroundColor: isDark ? a.dark : a.light }}
                  aria-hidden="true"
                />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ModeIcon({ mode }: { mode: (typeof MODES)[number]["key"] }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  } as const;

  if (mode === "system") {
    // 모니터 아이콘
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    );
  }
  if (mode === "light") {
    // 해 아이콘
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }
  // 달 아이콘
  return (
    <svg {...common}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
