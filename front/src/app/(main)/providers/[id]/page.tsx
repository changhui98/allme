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
  if (!provider) return { title: "업체를 찾을 수 없어요 | 올미" };
  return {
    title: `${provider.name} | 올미`,
    description: `${provider.tagline} — ${provider.region} · 평점 ${provider.rating}점 리뷰 ${provider.reviewCount}개`,
  };
}

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
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-32 lg:pb-8">
      <ProviderHero provider={provider} />

      <div className="mt-8 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="text-lg font-bold">소개</h2>
            <div className="mt-3 flex flex-col gap-3">
              {provider.bio.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed text-stone-600 dark:text-stone-300"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold">
              제공 서비스{" "}
              <span className="font-medium text-stone-400 dark:text-stone-500">
                {services.length}
              </span>
            </h2>
            <ul className="mt-3 divide-y divide-stone-200 dark:divide-stone-800">
              {services.map((service) => (
                <li key={service.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold leading-snug">
                        {service.title}
                        {showServiceCategory && (
                          <span className="ml-2 inline-block rounded-full bg-stone-100 px-2 py-0.5 align-middle text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                            {getCategoryLabel(service.category)}
                          </span>
                        )}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                        {service.description}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                        <svg
                          aria-hidden="true"
                          className="size-3.5"
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
                    <p className="shrink-0 text-base font-bold">
                      {formatPriceFrom(service.priceFrom)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold">포트폴리오</h2>
            <div className="mt-3">
              <PortfolioGrid items={provider.portfolio} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold">
              리뷰{" "}
              <span className="font-medium text-stone-400 dark:text-stone-500">
                {provider.reviewCount}
              </span>
            </h2>
            <div className="mt-3">
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
