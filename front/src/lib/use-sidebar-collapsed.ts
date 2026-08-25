"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "sidebarCollapsed";

/**
 * 데스크톱 셸 사이드바 접힘(레일) 상태 — Gmail식 햄버거 토글, localStorage에 기억.
 * 셸은 me 로드 후(클라이언트)에만 그리므로 lazy init에서 localStorage를 읽어도 하이드레이션 불일치가 없다.
 * 마이페이지·관리자 셸이 같은 키를 공유해 한쪽에서 접으면 다른 쪽도 접힌 채 열린다.
 */
export function useSidebarCollapsed(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const toggle = useCallback(() => {
    setCollapsed((v) => {
      const next = !v;
      try {
        if (next) localStorage.setItem(STORAGE_KEY, "1");
        else localStorage.removeItem(STORAGE_KEY);
      } catch {
        // 프라이빗 모드 등 — 상태만 바꾸고 기억은 포기
      }
      return next;
    });
  }, []);

  return [collapsed, toggle];
}
