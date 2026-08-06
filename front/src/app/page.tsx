import Link from "next/link";
import ServiceCard from "@/components/board/ServiceCard";
import DualCtaSection from "@/components/home/DualCtaSection";
import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import NewItemsSection from "@/components/home/NewItemsSection";
import TrustSection from "@/components/home/TrustSection";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { getPopularServicePosts } from "@/lib/mock/service-posts";

/**
 * 랜딩 페이지 (서버 컴포넌트 — SEO를 위해 전체 콘텐츠를 SSR).
 * 히어로는 즉시 렌더하고, 이후 섹션은 ScrollReveal로 스크롤 시 은은하게 등장한다.
 * 서버/클라이언트 경계(ScrollReveal 래핑)는 이 파일 한곳에서 관리한다.
 */
export default function Home() {
  const popularPosts = getPopularServicePosts(6);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <HeroSection />

      <ScrollReveal className="mt-8 sm:mt-12">
        <NewItemsSection />
      </ScrollReveal>

      <div className="mt-16 sm:mt-24">
        <HowItWorksSection />
      </div>

      <section aria-labelledby="popular-heading" className="mt-16 sm:mt-24">
        <ScrollReveal>
          <div className="flex items-baseline justify-between gap-4">
            <h2
              id="popular-heading"
              className="text-xl font-bold tracking-tight sm:text-2xl"
            >
              지금 인기 있는 서비스
            </h2>
            <Link
              href="/services"
              className="text-sm font-medium text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-white"
            >
              전체 보기 →
            </Link>
          </div>
        </ScrollReveal>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularPosts.map((post, index) => (
            <li key={post.id}>
              {/* 스태거는 줄 단위로 반복 — 아래 줄 카드가 과하게 늦지 않도록 */}
              <ScrollReveal delay={(index % 3) * 80} className="h-full">
                <ServiceCard post={post} />
              </ScrollReveal>
            </li>
          ))}
        </ul>
      </section>

      <ScrollReveal className="mt-16 sm:mt-24">
        <TrustSection />
      </ScrollReveal>

      <ScrollReveal className="mt-16 sm:mt-24">
        <DualCtaSection />
      </ScrollReveal>
    </main>
  );
}
