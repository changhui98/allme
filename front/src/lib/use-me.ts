"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMe, type LoginUserResult } from "@/lib/user";

/**
 * 로그인 상태 훅. 헤더(데스크톱)·모바일 네비가 같이 쓰므로
 * 모듈 레벨 promise 캐시로 페이지당 /me 호출을 1번으로 묶는다.
 * 로그인/로그아웃 직후에는 풀 리로드(window.location)로 캐시가 자연히 초기화된다.
 * 실패(연결 불가·5xx)는 캐시하지 않는다 — 백엔드 재기동 중 한 번 실패한 결과가
 * 새로고침 전까지 "비로그인"으로 고정되는 것을 막고, retry()로 즉시 재확인할 수 있다.
 * TanStack Query 도입 시 이 훅을 useQuery로 교체한다.
 */
let mePromise: Promise<LoginUserResult | null> | null = null;

export type MeState =
  | { status: "loading"; me: null }
  | { status: "ready"; me: LoginUserResult | null }
  /** /me 호출 자체가 실패(연결 불가·5xx) — 비로그인과 구분한다 */
  | { status: "error"; me: null };

export function useMe(): MeState & { retry: () => void } {
  const [state, setState] = useState<MeState>({ status: "loading", me: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    mePromise ??= fetchMe();
    mePromise.then(
      (me) => {
        if (alive) setState({ status: "ready", me });
      },
      () => {
        mePromise = null; // 실패 결과는 캐시하지 않는다
        if (alive) setState({ status: "error", me: null });
      },
    );
    return () => {
      alive = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    mePromise = null;
    setState({ status: "loading", me: null });
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, retry };
}
