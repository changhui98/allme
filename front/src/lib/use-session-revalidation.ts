"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { request } from "@/lib/api";
import type { LoginUserResult } from "@/lib/user";

/**
 * 클라이언트 내비게이션마다 세션을 재확인 — API 호출이 없는 페이지 전환에서도
 * 세션 만료를 감지한다(셸은 레이아웃이라 Link 이동 시 리마운트되지 않음).
 * 의도적으로 fetchMe()가 아닌 request()를 직접 쓴다:
 * 이미 로그인 상태였음을 알고 부르는 것이라 401 U011이면 request가 전역 만료
 * 신호를 발신하고(모달), 네트워크 장애 등 다른 실패는 조용히 무시한다(오탐 방지).
 * loggedIn=false(확인 전·비로그인)면 아무것도 안 한다 — 최초 진입 리다이렉트는 셸 소관.
 */
export function useSessionRevalidation(loggedIn: boolean) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current === pathname) return; // 최초 마운트 스킵
    prevPathname.current = pathname;
    if (!loggedIn) return;
    request<LoginUserResult>("/api/users/me").catch(() => {
      // U011이면 request가 이미 신호 발신 — 그 외 실패는 무시
    });
  }, [pathname, loggedIn]);
}
