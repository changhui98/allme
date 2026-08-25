"use client";

import { useSyncExternalStore } from "react";

/**
 * matchMedia 구독 훅 — 서버·첫 클라 렌더에선 false(하이드레이션 안정), 마운트 후 실제 값.
 * 렌더 분기용이며 이벤트 핸들러 안에서는 window.matchMedia를 직접 읽어도 된다.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** 마이페이지·관리자 셸의 데스크톱 브레이크포인트(mypage.css의 48rem과 동일) */
export const DESKTOP_MEDIA_QUERY = "(min-width: 48rem)";
