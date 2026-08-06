import Link from "next/link";

/**
 * 마무리 양방향 CTA — 수요자(해주세요)·공급자(업체 등록) 모두의 진입점 (서버 컴포넌트).
 * /business/register는 Footer와 동일한 placeholder 경로를 재사용한다.
 */
export default function DualCtaSection() {
  return (
    <section aria-label="시작하기" className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col items-start rounded-lg border border-stone-200 p-8 dark:border-zinc-800">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">
          원하는 서비스가 없나요?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-zinc-400">
          해주세요 게시판에 필요한 작업을 올려보세요. 조건에 맞는 업체들이
          견적을 제안해 드려요.
        </p>
        <Link
          href="/requests"
          className="mt-6 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          요청 올리러 가기
        </Link>
      </div>

      <div className="flex flex-col items-start rounded-lg border border-stone-200 p-8 dark:border-zinc-800">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">
          서비스를 제공하는 사장님이신가요?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-zinc-400">
          무료로 업체를 등록하고 새 고객을 만나보세요. 정산까지 올미가
          깔끔하게 처리해 드립니다.
        </p>
        <Link
          href="/business/register"
          className="mt-6 rounded-md border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          업체 등록하기
        </Link>
      </div>
    </section>
  );
}
