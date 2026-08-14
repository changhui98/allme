import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PortfolioGrid from "@/components/provider/PortfolioGrid";
import ProviderCtaCard from "@/components/provider/ProviderCtaCard";
import ProviderHero from "@/components/provider/ProviderHero";
import ReviewList from "@/components/provider/ReviewList";
import { getCategoryLabel } from "@/lib/categories";
import { formatPriceFrom } from "@/lib/format";
import { getProvider, getProviders } from "@/lib/mock/providers";
import { getServicePostsByProvider } from "@/lib/mock/service-posts";

/** 목업 업체 전체를 빌드 시점에 정적 생성한다 (업체 상세는 SEO 필수). */
export function generateStaticParams() {
  return getProviders().map((provider) => ({ id: provider.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const provider = getProvider(id);
  if (!provider) return { title: "업체를 찾을 수 없어요" };
  return {
    title: provider.name,
    description: `${provider.tagline} — ${provider.region} · 평점 ${provider.rating}점 리뷰 ${provider.reviewCount}개`,
  };
}

/** 스타일: styles/pages/provider.css */
export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const provider = getProvider(id);
  if (!provider) notFound();

  const services = getServicePostsByProvider(provider.id);
  const minPriceFrom = Math.min(...services.map((s) => s.priceFrom));
  const showServiceCategory = provider.categories.length > 1;

  return (
    <main className="page-container provider-page">
      <ProviderHero provider={provider} />

      <div className="provider-page__layout">
        <div className="provider-page__main">
          <section>
            <h2 className="provider-page__heading">소개</h2>
            <div className="provider-page__bio">
              {provider.bio.map((paragraph, i) => (
                <p key={i} className="provider-page__paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="provider-page__heading">
              제공 서비스{" "}
              <span className="provider-page__count">{services.length}</span>
            </h2>
            <ul className="provider-page__services">
              {services.map((service) => (
                <li key={service.id} className="provider-page__service">
                  <div className="provider-page__service-row">
                    <div>
                      <h3 className="provider-page__service-title">
                        {service.title}
                        {showServiceCategory && (
                          <span className="pill provider-page__service-badge">
                            {getCategoryLabel(service.category)}
                          </span>
                        )}
                      </h3>
                      <p className="provider-page__service-desc">
                        {service.description}
                      </p>
                      <p className="provider-page__service-duration">
                        <svg
                          aria-hidden="true"
                          className="provider-page__clock-icon"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .27.14.52.38.65l3.5 2a.75.75 0 1 0 .74-1.3l-3.12-1.78V5Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        소요 {service.duration}
                      </p>
                    </div>
                    <p className="provider-page__service-price">
                      {formatPriceFrom(service.priceFrom)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="provider-page__heading">포트폴리오</h2>
            <div className="provider-page__section-body">
              <PortfolioGrid items={provider.portfolio} />
            </div>
          </section>

          <section>
            <h2 className="provider-page__heading">
              리뷰{" "}
              <span className="provider-page__count">
                {provider.reviewCount}
              </span>
            </h2>
            <div className="provider-page__section-body">
              <ReviewList
                reviews={provider.reviews}
                totalCount={provider.reviewCount}
              />
            </div>
          </section>
        </div>

        <ProviderCtaCard
          priceFrom={minPriceFrom}
          responseRate={provider.responseRate}
          variant="sidebar"
        />
      </div>

      <ProviderCtaCard
        priceFrom={minPriceFrom}
        responseRate={provider.responseRate}
        variant="bottom-bar"
      />
    </main>
  );
}
