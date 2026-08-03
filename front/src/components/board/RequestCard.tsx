import { getCategoryLabel } from "@/lib/categories";
import type { RequestPost } from "@/lib/mock/request-posts";

/**
 * "해주세요" 목록의 요청 카드 (서버 컴포넌트).
 * 상세 페이지가 아직 없어 링크 없이 정보만 렌더한다.
 */
export default function RequestCard({ post }: { post: RequestPost }) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-lg border border-stone-200 p-5 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600 dark:bg-zinc-800 dark:text-zinc-300">
          {getCategoryLabel(post.category)}
        </span>
        <span className="text-xs text-stone-400 dark:text-zinc-500">
          {post.createdAt}
        </span>
      </div>

      <div>
        <h2 className="font-semibold leading-snug">{post.title}</h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-zinc-400">
          {post.authorNickname} · {post.region}
        </p>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-stone-400 dark:text-zinc-500">희망 일정</dt>
        <dd className="text-stone-600 dark:text-zinc-300">
          {post.preferredSchedule}
        </dd>
        <dt className="text-stone-400 dark:text-zinc-500">예산</dt>
        <dd className="font-medium">{post.budget}</dd>
      </dl>

      <p className="mt-auto text-sm text-stone-500 dark:text-zinc-400">
        받은 제안{" "}
        <span className="font-semibold text-stone-700 dark:text-zinc-200">
          {post.proposalCount}건
        </span>
      </p>
    </article>
  );
}
