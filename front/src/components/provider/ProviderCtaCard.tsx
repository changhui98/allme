import { formatPriceFrom } from "@/lib/format";

/**
 * 업체 상세의 예약/문의 CTA (서버 컴포넌트).
 * 데스크톱은 우측 sticky 사이드바, 모바일은 하단 고정 바로 렌더한다.
 * 예약·채팅 기능이 아직 없어 버튼은 비활성 상태로 두고 안내 문구를 붙인다.
 */
export default function ProviderCtaCard({
  priceFrom,
  responseRate,
  variant,
}: {
  /** 업체 보유 서비스 중 최저 시작가(원) */
  priceFrom: number;
  responseRate: number;
  variant: "sidebar" | "bottom-bar";
}) {
  const reserveButton = (
    <button
      type="button"
      disabled
      className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
    >
      예약 요청
    </button>
  );
  const chatButton = (
    <button
      type="button"
      disabled
      className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
    >
      채팅 문의
    </button>
  );

  if (variant === "bottom-bar") {
    return (
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-background px-4 py-3 lg:hidden dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div>
            <p className="text-xs text-stone-500 dark:text-zinc-400">시작가</p>
            <p className="text-base font-bold">{formatPriceFrom(priceFrom)}</p>
          </div>
          <div className="flex gap-2">
            {chatButton}
            {reserveButton}
          </div>
        </div>
        <p className="mx-auto mt-1.5 max-w-6xl text-xs text-stone-400 dark:text-zinc-500">
          예약·채팅 기능은 오픈 준비 중이에요
        </p>
      </div>
    );
  }

  return (
    <aside className="sticky top-20 hidden rounded-lg border border-stone-200 p-5 lg:block dark:border-zinc-800">
      <p className="text-xs text-stone-500 dark:text-zinc-400">시작가</p>
      <p className="mt-0.5 text-2xl font-bold">{formatPriceFrom(priceFrom)}</p>
      <div className="mt-4 flex flex-col gap-2">
        {reserveButton}
        {chatButton}
      </div>
      <p className="mt-3 text-xs text-stone-400 dark:text-zinc-500">
        예약·채팅 기능은 오픈 준비 중이에요
      </p>
      <p className="mt-4 border-t border-stone-200 pt-3 text-xs text-stone-500 dark:border-zinc-800 dark:text-zinc-400">
        평균 응답률{" "}
        <span className="font-semibold text-stone-700 dark:text-zinc-200">
          {responseRate}%
        </span>{" "}
        · 빠르게 답변드려요
      </p>
    </aside>
  );
}
