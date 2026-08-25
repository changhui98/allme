"use client";

import { useTheme } from "next-themes";
import { useRef, useState, useSyncExternalStore } from "react";
import { SettingsIcon } from "@/components/icons/SolarIcons";
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

const FONT_SIZE_STORAGE_KEY = "fontSize";
/** 기본(최대)은 <html>에 속성을 두지 않는다 — base.css의 html[data-font-size] 규칙과 키 1:1 */
const DEFAULT_FONT_SIZE = "large";

/** 글자 크기 단계 — 작→큼 순서(스테퍼의 −/+가 이 배열의 인덱스를 이동한다) */
const FONT_SIZES = [
  { key: "small", label: "작게" },
  { key: "medium", label: "중간" },
  { key: "large", label: "최대" },
] as const;

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

/** 파스텔 — 위 6색과 같은 색상의 연한 변형(tokens.css 파스텔 블록과 키 1:1). 같은 accent 상태를 공유한다. */
const PASTEL_ACCENTS = [
  { key: "peach", label: "피치", light: "#efb39a", dark: "#f1c2ae" },
  { key: "mint", label: "민트", light: "#5eead4", dark: "#99f6e4" },
  { key: "sage", label: "세이지", light: "#86efac", dark: "#bbf7d0" },
  { key: "sky", label: "스카이", light: "#93c5fd", dark: "#bfdbfe" },
  { key: "lavender", label: "라벤더", light: "#a5b4fc", dark: "#c7d2fe" },
  { key: "lilac", label: "라일락", light: "#c4b5fd", dark: "#ddd6fe" },
] as const;

const MODES = [
  { key: "system", label: "시스템" },
  { key: "light", label: "라이트" },
  { key: "dark", label: "다크" },
] as const;

/**
 * 화면 설정 드롭다운: 모드(시스템/라이트/다크) + 컬러 테마 스와치 + 글자 크기 스테퍼.
 * 모드는 next-themes(setTheme), 컬러는 <html data-accent> + localStorage로 관리한다.
 * 글자 크기는 <html data-font-size> + localStorage("fontSize") — 컬러와 같은 패턴이며
 * 기본값(최대)이면 속성·스토리지를 지운다. 실제 크기는 base.css의 html[data-font-size]가 결정.
 * 컬러는 하나를 고르면 라이트/다크 양쪽에 공통 적용된다(스와치만 현재 모드 색으로 표시).
 * 컬러 테마(진한 6색)와 파스텔(연한 6색)은 그룹만 다를 뿐 하나의 선택값(accent)을 공유한다.
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
      : (document.documentElement.getAttribute("data-accent") ??
        DEFAULT_ACCENT),
  );
  const [fontSize, setFontSize] = useState(() =>
    typeof document === "undefined"
      ? DEFAULT_FONT_SIZE
      : (document.documentElement.getAttribute("data-font-size") ??
        DEFAULT_FONT_SIZE),
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

  const selectFontSize = (key: string) => {
    setFontSize(key);
    if (key === DEFAULT_FONT_SIZE) {
      document.documentElement.removeAttribute("data-font-size");
      localStorage.removeItem(FONT_SIZE_STORAGE_KEY);
    } else {
      document.documentElement.setAttribute("data-font-size", key);
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, key);
    }
  };

  // 마운트 전: 레이아웃 흔들림 방지용 동일 크기 placeholder
  if (!mounted) {
    return <span className="icon-btn" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";
  // 저장값이 알 수 없는 키면(구버전 등) 기본 단계로 취급
  const fontIdx = Math.max(
    0,
    FONT_SIZES.findIndex((f) => f.key === fontSize),
  );

  return (
    <div ref={rootRef} className="theme-menu">
      <button
        type="button"
        aria-label="화면 설정"
        aria-expanded={open}
        aria-controls="theme-menu-panel"
        onClick={() => setOpen((v) => !v)}
        className="icon-btn"
      >
        <SettingsIcon size={20} />
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
              <Swatch
                key={a.key}
                accent={a}
                active={accent === a.key}
                isDark={isDark}
                onSelect={selectAccent}
              />
            ))}
          </div>

          <p
            className="theme-menu__title theme-menu__title--sub"
            id="theme-menu-pastel-label"
          >
            파스텔
          </p>
          <div
            role="radiogroup"
            aria-labelledby="theme-menu-pastel-label"
            className="theme-menu__swatches"
          >
            {PASTEL_ACCENTS.map((a) => (
              <Swatch
                key={a.key}
                accent={a}
                active={accent === a.key}
                isDark={isDark}
                onSelect={selectAccent}
              />
            ))}
          </div>

          <hr className="theme-menu__divider" />

          <p className="theme-menu__title" id="theme-menu-font-label">
            글자 크기
          </p>
          <div
            role="group"
            aria-labelledby="theme-menu-font-label"
            className="theme-menu__stepper"
          >
            <button
              type="button"
              aria-label="글자 작게"
              disabled={fontIdx === 0}
              onClick={() => selectFontSize(FONT_SIZES[fontIdx - 1].key)}
              className="theme-menu__step-btn"
            >
              −
            </button>
            <span className="theme-menu__step-label" aria-live="polite">
              {FONT_SIZES[fontIdx].label}
            </span>
            <button
              type="button"
              aria-label="글자 크게"
              disabled={fontIdx === FONT_SIZES.length - 1}
              onClick={() => selectFontSize(FONT_SIZES[fontIdx + 1].key)}
              className="theme-menu__step-btn"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type AccentOption = (typeof ACCENTS)[number] | (typeof PASTEL_ACCENTS)[number];

/** 컬러 스와치 라디오 — 점 색은 현재 모드(라이트/다크)의 미리보기 값 */
function Swatch({
  accent,
  active,
  isDark,
  onSelect,
}: {
  accent: AccentOption;
  active: boolean;
  isDark: boolean;
  onSelect: (key: string) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={() => onSelect(accent.key)}
      className={`theme-menu__swatch${active ? " is-active" : ""}`}
    >
      <span
        className="theme-menu__swatch-dot"
        style={{ backgroundColor: isDark ? accent.dark : accent.light }}
        aria-hidden="true"
      />
      {accent.label}
    </button>
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
