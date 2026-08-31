"use client";

import { useEffect, useState } from "react";
import ServiceCard from "@/components/board/ServiceCard";
import ScrollReveal from "@/components/motion/ScrollReveal";
import {
  fetchOpenServiceListings,
  type OpenServiceListingSummary,
} from "@/lib/provider-services";

/**
 * 랜딩 "지금 인기 있는 서비스" 목록 — 공개 서비스 API 최신 6건(리뷰 도메인 전이라 인기 정렬은 후속).
 * 섹션 헤딩은 page.tsx가 SSR로 그리고, 목록만 클라이언트에서 불러온다.
 * 실패·빈 값이면 조용히 비워 랜딩 흐름을 막지 않는다.
 */
export default function PopularServicesSection() {
  const [posts, setPosts] = useState<OpenServiceListingSummary[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchOpenServiceListings({ page: 0, size: 6 })
      .then((data) => {
        if (!cancelled) setPosts(data.content);
      })
      .catch(() => {
        // 랜딩은 백엔드 없이도 열려야 한다 — 실패 시 섹션만 비운다
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (posts.length === 0) return null;

  return (
    <ul className="card-grid">
      {posts.map((post, index) => (
        <li key={post.id}>
          {/* 스태거는 줄 단위로 반복 — 아래 줄 카드가 과하게 늦지 않도록 */}
          <ScrollReveal delay={(index % 3) * 80} className="home-page__card-reveal">
            <ServiceCard post={post} />
          </ScrollReveal>
        </li>
      ))}
    </ul>
  );
}
