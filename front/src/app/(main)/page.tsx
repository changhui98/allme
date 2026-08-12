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
 * 스타일: styles/pages/home.css
 */
export default function Home() {
  const popularPosts = getPopularServicePosts(6);

  return (
    <main className="page-container home-page">
      <HeroSection />

      <ScrollReveal className="home-page__section home-page__section--tight">
        <NewItemsSection />
      </ScrollReveal>

      <div className="home-page__section">
        <HowItWorksSection />
      </div>

      <section aria-labelledby="popular-heading" className="home-page__section">
        <ScrollReveal>
          <div className="home-page__section-head">
            <h2 id="popular-heading" className="home-page__heading">
              지금 인기 있는 서비스
            </h2>
            <Link href="/services" className="home-page__more">
              전체 보기 →
            </Link>
          </div>
        </ScrollReveal>
        <ul className="card-grid">
          {popularPosts.map((post, index) => (
            <li key={post.id}>
              {/* 스태거는 줄 단위로 반복 — 아래 줄 카드가 과하게 늦지 않도록 */}
              <ScrollReveal
                delay={(index % 3) * 80}
                className="home-page__card-reveal"
              >
                <ServiceCard post={post} />
              </ScrollReveal>
            </li>
          ))}
        </ul>
      </section>

      <ScrollReveal className="home-page__section">
        <TrustSection />
      </ScrollReveal>

      <ScrollReveal className="home-page__section">
        <DualCtaSection />
      </ScrollReveal>
    </main>
  );
}
