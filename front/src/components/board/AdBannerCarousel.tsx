"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AdBanner } from "@/lib/mock/ad-banners";

const ROTATE_INTERVAL_MS = 4000;

/**
 * 해드려요 페이지 상단의 광고 배너 캐러셀.
 * 4초 간격 자동 롤링, hover·키보드 포커스 시 일시정지.
 * 데이터는 서버 페이지에서 내려주고 이 컴포넌트는 표시만 담당한다.
 */
export default function AdBannerCarousel({ banners }: { banners: AdBanner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || banners.length < 2) return;
    // OS의 "동작 줄이기" 설정 시 자동 롤링을 하지 않는다.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % banners.length),
      ROTATE_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, [paused, banners.length]);

  if (banners.length === 0) return null;
  const banner = banners[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="광고 배너"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/*
       * 비율: 모바일 2:1 / 데스크톱 4:1 (쿠팡 메인 배너 720×380 / 1920×450 기준).
       * 추후 광고주 이미지는 데스크톱 1920×480(4:1), 모바일 750×375(2:1)로 받아
       * next/image fill + object-cover로 채운다.
       */}
      <Link
        href={banner.href}
        className={`flex aspect-[2/1] flex-col justify-center rounded-lg px-14 text-white sm:aspect-[4/1] sm:px-16 ${banner.themeClass}`}
      >
        <span className="flex items-center gap-2 text-xs text-white/70">
          <span className="rounded border border-white/40 px-1 font-semibold leading-4">
            AD
          </span>
          {banner.advertiserName}
        </span>
        <strong className="mt-1.5 text-xl leading-snug sm:text-2xl">
          {banner.headline}
        </strong>
        <span className="mt-1 text-sm text-white/80 sm:text-base">
          {banner.subcopy}
        </span>
      </Link>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            aria-label="이전 광고"
            onClick={() =>
              setIndex((i) => (i - 1 + banners.length) % banners.length)
            }
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/70 hover:bg-white/15 hover:text-white"
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            aria-label="다음 광고"
            onClick={() => setIndex((i) => (i + 1) % banners.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/70 hover:bg-white/15 hover:text-white"
          >
            <ArrowIcon direction="right" />
          </button>

          <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`${i + 1}번째 광고 보기`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === index ? "bg-white" : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === "left" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  );
}
