"use client";

import { useEffect, useState } from "react";
import { fetchMe, type LoginUserResult } from "@/lib/user";

/**
 * 로그인 상태 훅. 헤더(데스크톱)·모바일 네비가 같이 쓰므로
 * 모듈 레벨 promise 캐시로 페이지당 /me 호출을 1번으로 묶는다.
 * 로그인/로그아웃 직후에는 풀 리로드(window.location)로 캐시가 자연히 초기화된다.
 * TanStack Query 도입 시 이 훅을 useQuery로 교체한다.
 */
let mePromise: Promise<LoginUserResult | null> | null = null;

export type MeState =
  | { status: "loading"; me: null }
  | { status: "ready"; me: LoginUserResult | null };

export function useMe(): MeState {
  const [state, setState] = useState<MeState>({ status: "loading", me: null });

  useEffect(() => {
    let alive = true;
    mePromise ??= fetchMe();
    mePromise.then((me) => {
      if (alive) setState({ status: "ready", me });
    });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
