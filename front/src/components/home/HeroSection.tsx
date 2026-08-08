import Link from "next/link";
import { CATEGORIES, type CategoryId } from "@/lib/categories";

/**
 * 랜딩 첫 화면 — 가치 제안 + 검색 + 양방향 CTA + 카테고리 진입 (서버 컴포넌트).
 * LCP·SEO를 위해 리빌 애니메이션 없이 즉시 렌더한다.
 */
export default function HeroSection() {
  return (
    <section className="py-12 text-center sm:py-20">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-primary"
        />
        서울 지역 오픈
      </span>

      <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
        필요한 서비스,
        <br className="sm:hidden" /> 찾고 맡기고 결제까지
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base text-stone-500 sm:text-lg dark:text-stone-400">
        청소부터 웹 제작까지 — 예약, 안전결제, 정산을 올미 한곳에서.
        검증된 업체와 안심하고 거래하세요.
      </p>

      {/* 검색 — 헤더 검색 폼과 동일한 GET /services?q= 흐름의 확대판 */}
      <form
        role="search"
        action="/services"
        method="get"
        className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-stone-300 bg-white py-2 pl-5 pr-2 shadow-sm focus-within:border-stone-400 dark:border-stone-700 dark:bg-stone-800/60 dark:focus-within:border-stone-500"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="shrink-0 text-stone-400"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          name="q"
          placeholder="어떤 서비스가 필요하세요? 예: 입주청소"
          className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400 sm:text-base"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          검색
        </button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/services"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          서비스 둘러보기
        </Link>
        <Link
          href="/requests"
          className="rounded-md border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          견적 요청 올리기
        </Link>
      </div>

      {/* 카테고리 바로가기 — 검색 페이지가 따로 없어 카테고리 필터가 탐색 입구 역할 */}
      <ul className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORIES.map((category) => (
          <li key={category.id}>
            <Link
              href={`/services?category=${category.id}`}
              className="flex flex-col items-center gap-2 rounded-lg border border-stone-200 p-5 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-stone-800 dark:hover:border-stone-700 dark:hover:bg-stone-800/60"
            >
              <span className="text-stone-500 dark:text-stone-400">
                <CategoryIcon id={category.id} />
              </span>
              <span className="text-sm font-medium">{category.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CategoryIcon({ id }: { id: CategoryId }) {
  const paths: Record<CategoryId, React.ReactNode> = {
    // 청소: 반짝임
    cleaning: (
      <>
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
        <path d="M7.5 7.5l2 2M14.5 14.5l2 2M16.5 7.5l-2 2M9.5 14.5l-2 2" />
      </>
    ),
    // 인테리어: 집
    interior: (
      <>
        <path d="M3 11l9-8 9 8" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9 21v-6h6v6" />
      </>
    ),
    // 페인트·도장: 롤러
    painting: (
      <>
        <rect x="4" y="4" width="14" height="6" rx="1" />
        <path d="M18 6h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-9v3" />
        <rect x="10" y="14" width="2" height="6" rx="0.5" />
      </>
    ),
    // 웹·디자인 제작: 모니터
    "web-design": (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M8 9l-2 2.5L8 14M16 9l2 2.5L16 14" />
      </>
    ),
  };

  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[id]}
    </svg>
  );
}
