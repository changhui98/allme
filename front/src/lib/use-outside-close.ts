"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * 열림 상태의 드롭다운/패널을 ESC 키 또는 바깥 pointerdown으로 닫는 공용 훅.
 * (ThemeMenu·MobileNav·MypageShell의 반복 패턴 통합)
 *
 * refs: "내부"로 판정할 요소들 — 하나라도 클릭 지점을 포함하면 닫지 않는다.
 * 버튼과 패널에 공통 래퍼가 없으면 [버튼 ref, 패널 ref]처럼 여러 개를 넘긴다.
 * 배열은 순회만 하므로 매 렌더 새로 만들어도 무방하다(구독은 open에만 반응).
 */
export function useOutsideClose(
  open: boolean,
  onClose: () => void,
  refs: ReadonlyArray<RefObject<HTMLElement | null>>,
): void {
  // 최신 콜백/refs를 ref로 들고 있어 effect 재구독 없이 항상 최신을 호출한다
  // (렌더 중 ref 쓰기는 react-hooks/refs 위반이라 매 렌더 effect에서 갱신)
  const onCloseRef = useRef(onClose);
  const refsRef = useRef(refs);
  useEffect(() => {
    onCloseRef.current = onClose;
    refsRef.current = refs;
  });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    const onPointerDown = (e: PointerEvent) => {
      const inside = refsRef.current.some((r) =>
        r.current?.contains(e.target as Node),
      );
      if (!inside) onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);
}
