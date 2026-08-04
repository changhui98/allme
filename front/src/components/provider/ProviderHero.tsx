import { getCategoryLabel } from "@/lib/categories";
import type { Provider } from "@/lib/mock/providers";

/**
 * 업체 상세 상단의 프로필 히어로 (서버 컴포넌트).
 * 아바타·상호·인증 뱃지·카테고리·평점과 신뢰 지표 3종을 보여준다.
 * 프로필 이미지는 스토리지 도입 전까지 그라데이션 + 이니셜로 대체한다.
 */
export default function ProviderHero({ provider }: { provider: Provider }) {
  return (
    <section>
      <div className="flex items-start gap-4 sm:gap-5">
        <div
          aria-hidden="true"
          className={`flex size-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white sm:size-20 sm:text-3xl ${provider.avatarClass}`}
        >
          {provider.name.charAt(0)}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {provider.name}
            </h1>
            {provider.verified && (
              <span
                className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                aria-label={`사업자 인증 완료 (사업자등록번호 ${provider.businessRegistrationMasked})`}
                title={`사업자등록번호 ${provider.businessRegistrationMasked}`}
              >
                <svg
                  aria-hidden="true"
                  className="size-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.6 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z"
                    clipRule="evenodd"
                  />
                </svg>
                사업자 인증
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-stone-500 dark:text-zinc-400">
            {provider.tagline}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {provider.categories.map((category) => (
              <span
                key={category}
                className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {getCategoryLabel(category)}
              </span>
            ))}
            <span className="text-stone-500 dark:text-zinc-400">
              {provider.region}
            </span>
            <span
              className="flex items-center gap-1 text-stone-600 dark:text-zinc-300"
              aria-label={`평점 ${provider.rating}점, 리뷰 ${provider.reviewCount}개`}
            >
              <span aria-hidden="true" className="text-amber-500">
                ★
              </span>
              <span className="font-medium">{provider.rating.toFixed(1)}</span>
              <span className="text-stone-400 dark:text-zinc-500">
                ({provider.reviewCount})
              </span>
            </span>
          </div>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 divide-x divide-stone-200 rounded-lg border border-stone-200 py-4 text-center dark:divide-zinc-800 dark:border-zinc-800">
        <div>
          <dt className="text-xs text-stone-500 dark:text-zinc-400">응답률</dt>
          <dd className="mt-1 font-bold">{provider.responseRate}%</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 dark:text-zinc-400">경력</dt>
          <dd className="mt-1 font-bold">{provider.careerYears}년</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 dark:text-zinc-400">
            거래 완료
          </dt>
          <dd className="mt-1 font-bold">
            {provider.completedCount.toLocaleString("ko-KR")}건
          </dd>
        </div>
      </dl>
    </section>
  );
}
