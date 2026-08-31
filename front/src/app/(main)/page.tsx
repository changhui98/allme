import Link from "next/link";
import DualCtaSection from "@/components/home/DualCtaSection";
import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import NewItemsSection from "@/components/home/NewItemsSection";
import TrustSection from "@/components/home/TrustSection";
import PopularServicesSection from "@/components/home/PopularServicesSection";
import ScrollReveal from "@/components/motion/ScrollReveal";

/**
 * 랜딩 페이지 (서버 컴포넌트 — SEO를 위해 전체 콘텐츠를 SSR).
 * 히어로는 즉시 렌더하고, 이후 섹션은 ScrollReveal로 스크롤 시 은은하게 등장한다.
 * 서버/클라이언트 경계(ScrollReveal 래핑)는 이 파일 한곳에서 관리한다.
 * 스타일: styles/pages/home.css
 */
export default function Home() {
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
        {/* 목록은 공개 서비스 API — 최신 6건(리뷰 도메인 전이라 인기 정렬은 후속) */}
        <PopularServicesSection />
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
