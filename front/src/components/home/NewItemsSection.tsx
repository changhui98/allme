import Link from "next/link";
import RollingRow from "@/components/motion/RollingRow";
import { getCategoryLabel } from "@/lib/categories";
import { getNewProviders, type Provider } from "@/lib/mock/providers";
import {
  getRequestPosts,
  type RequestPost,
} from "@/lib/mock/request-posts";

const ROLLING_COUNT = 8;

/**
 * "방금 올라왔어요" — 새 요청·새 업체를 한 줄 아이템 롤링으로 보여준다 (서버 컴포넌트).
 * 아이템은 여기서 서버 렌더해 RollingRow(클라이언트)에 노드로 넘긴다 → SSR 보존.
 */
export default function NewItemsSection() {
  const requests = getRequestPosts().slice(0, ROLLING_COUNT);
  const providers = getNewProviders(ROLLING_COUNT);

  return (
    <section aria-labelledby="new-items-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="new-items-heading"
          className="text-xl font-bold tracking-tight sm:text-2xl"
        >
          방금 올라왔어요
        </h2>
      </div>

      <div className="mt-5 space-y-6">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-sm font-semibold text-stone-500 dark:text-zinc-400">
              새 요청
            </h3>
            <Link
              href="/requests"
              className="text-sm font-medium text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-white"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="mt-2">
            <RollingRow
              label="새로 올라온 요청"
              items={requests.map((post) => (
                <NewRequestItem key={post.id} post={post} />
              ))}
            />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-sm font-semibold text-stone-500 dark:text-zinc-400">
              새로 합류한 업체
            </h3>
          </div>
          <div className="mt-2">
            <RollingRow
              label="새로 합류한 업체"
              items={providers.map((provider) => (
                <NewProviderItem key={provider.id} provider={provider} />
              ))}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/** 요청 상세 라우트가 아직 없어 목록으로 보낸다. */
function NewRequestItem({ post }: { post: RequestPost }) {
  return (
    <Link
      href="/requests"
      className="flex h-full flex-col gap-1.5 rounded-lg border border-stone-200 px-4 py-3 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
    >
      <div className="flex items-center gap-2">
        <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600 dark:bg-zinc-800 dark:text-zinc-300">
          {getCategoryLabel(post.category)}
        </span>
        <span className="truncate text-sm font-semibold">{post.title}</span>
      </div>
      <p className="truncate text-xs text-stone-500 dark:text-zinc-400">
        {post.region} · 예산 {post.budget} · 제안 {post.proposalCount}건
      </p>
    </Link>
  );
}

function NewProviderItem({ provider }: { provider: Provider }) {
  return (
    <Link
      href={`/providers/${provider.id}`}
      className="flex h-full items-center gap-3 rounded-lg border border-stone-200 px-4 py-3 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
    >
      <span
        aria-hidden="true"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${provider.avatarClass}`}
      >
        {provider.name.charAt(0)}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold">
            {provider.name}
          </span>
          {provider.verified && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              인증
            </span>
          )}
        </span>
        <span className="mt-0.5 block truncate text-xs text-stone-500 dark:text-zinc-400">
          {provider.tagline} · {provider.region}
        </span>
      </span>
    </Link>
  );
}
