"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AdBanner } from "@/lib/mock/ad-banners";

const ROTATE_INTERVAL_MS = 4000;

/**
 * 해드려요 페이지 상단의 광고 배너 캐러셀.
 * 4초 간격 자동 롤링, hover·키보드 포커스 시 일시정지.
 * 데이터는 서버 페이지에서 내려주고 이 컴포넌트는 표시만 담당한다.
 * 스타일: styles/pages/board.css
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
      className="ad-carousel"
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
        className={`ad-carousel__banner ${banner.themeClass}`}
      >
        <span className="ad-carousel__ad-row">
          <span className="ad-carousel__ad-chip">AD</span>
          {banner.advertiserName}
        </span>
        <strong className="ad-carousel__headline">{banner.headline}</strong>
        <span className="ad-carousel__subcopy">{banner.subcopy}</span>
      </Link>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            aria-label="이전 광고"
            onClick={() =>
              setIndex((i) => (i - 1 + banners.length) % banners.length)
            }
            className="ad-carousel__arrow ad-carousel__arrow--prev"
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            aria-label="다음 광고"
            onClick={() => setIndex((i) => (i + 1) % banners.length)}
            className="ad-carousel__arrow ad-carousel__arrow--next"
          >
            <ArrowIcon direction="right" />
          </button>

          <div className="ad-carousel__dots">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`${i + 1}번째 광고 보기`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`ad-carousel__dot${
                  i === index ? " ad-carousel__dot--active" : ""
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
