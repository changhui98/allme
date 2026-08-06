"use client";

import { useEffect, useState } from "react";

const ROTATE_INTERVAL_MS = 3000;
/** 데스크톱에서 동시에 보이는 최대 칸 수 — 끝부분 빈칸 방지용 복제 개수와 일치시킨다 */
const MAX_VISIBLE = 3;

/**
 * 여러 아이템이 동시에 보이면서 몇 초마다 한 칸씩 옆으로 넘어가는 롤링 행.
 * 랜딩의 "방금 올라왔어요" 신규 요청·업체 목록에 사용한다.
 *
 * - 표시 개수는 CSS로만 제어: 모바일 1 / sm 2 / lg 3칸
 * - 한 칸 이동량은 트랙 너비의 1/전체 아이템 수라서 브레이크포인트와 무관하게 정확하다
 * - 끊김 없는 순환: 앞쪽 아이템을 복제해 이어붙이고, 원본 끝에 도달하면
 *   transition 없이 0으로 되돌린다 (복제본과 원본이 같은 그림이라 점프가 보이지 않음)
 * - hover·포커스 시 일시정지, "동작 줄이기" 설정 시 자동 롤링 없음 (AdBannerCarousel 관례)
 * - 아이템은 서버에서 렌더한 노드를 받아 표시만 담당 → 초기 HTML에 콘텐츠 포함(SEO)
 */
export default function RollingRow({
  items,
  label,
}: {
  items: React.ReactNode[];
  label: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // 복제본 → 원본으로 되감을 때 한 프레임 동안 transition을 끈다
  const [instant, setInstant] = useState(false);

  const rolling = items.length > MAX_VISIBLE;

  useEffect(() => {
    if (!rolling || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(
      () => setIndex((i) => Math.min(i + 1, items.length)),
      ROTATE_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, [rolling, paused, items.length]);

  useEffect(() => {
    if (!instant) return;
    const id = requestAnimationFrame(() => setInstant(false));
    return () => cancelAnimationFrame(id);
  }, [instant]);

  if (items.length === 0) return null;

  const rendered = rolling ? [...items, ...items.slice(0, MAX_VISIBLE)] : items;
  const step = 100 / rendered.length;

  return (
    <div
      aria-roledescription="carousel"
      aria-label={label}
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <ul
        className={`-mx-1.5 flex ${instant ? "" : "transition-transform duration-500 ease-out"}`}
        style={{ transform: `translateX(-${index * step}%)` }}
        onTransitionEnd={(e) => {
          // 자식(카드 hover 등)의 transitionend 버블링은 무시한다
          if (e.target !== e.currentTarget) return;
          // 원본 끝(= 첫 복제본 위치)에 도달하면 소리 없이 처음으로 되감기
          if (index >= items.length) {
            setInstant(true);
            setIndex(0);
          }
        }}
      >
        {rendered.map((item, i) => {
          const isClone = i >= items.length;
          return (
            <li
              key={i}
              inert={isClone || undefined}
              className="shrink-0 grow-0 basis-full px-1.5 sm:basis-1/2 lg:basis-1/3"
            >
              {item}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
