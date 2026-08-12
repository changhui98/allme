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
 * 스타일: styles/pages/home.css
 */
export default function NewItemsSection() {
  const requests = getRequestPosts().slice(0, ROLLING_COUNT);
  const providers = getNewProviders(ROLLING_COUNT);

  return (
    <section aria-labelledby="new-items-heading" className="new-items">
      <div className="new-items__head">
        <h2 id="new-items-heading" className="new-items__heading">
          방금 올라왔어요
        </h2>
      </div>

      <div className="new-items__groups">
        <div>
          <div className="new-items__head">
            <h3 className="new-items__group-title">새 요청</h3>
            <Link href="/requests" className="new-items__more">
              전체 보기 →
            </Link>
          </div>
          <div className="new-items__row">
            <RollingRow
              label="새로 올라온 요청"
              items={requests.map((post) => (
                <NewRequestItem key={post.id} post={post} />
              ))}
            />
          </div>
        </div>

        <div>
          <div className="new-items__head">
            <h3 className="new-items__group-title">새로 합류한 업체</h3>
          </div>
          <div className="new-items__row">
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
      className="card card--interactive new-items__item new-items__item--request"
    >
      <div className="new-items__item-head">
        <span className="pill new-items__pill">
          {getCategoryLabel(post.category)}
        </span>
        <span className="new-items__item-title">{post.title}</span>
      </div>
      <p className="new-items__item-meta">
        {post.region} · 예산 {post.budget} · 제안 {post.proposalCount}건
      </p>
    </Link>
  );
}

function NewProviderItem({ provider }: { provider: Provider }) {
  return (
    <Link
      href={`/providers/${provider.id}`}
      className="card card--interactive new-items__item new-items__item--provider"
    >
      <span
        aria-hidden="true"
        className={`new-items__avatar ${provider.avatarClass}`}
      >
        {provider.name.charAt(0)}
      </span>
      <span className="new-items__item-body">
        <span className="new-items__name-row">
          <span className="new-items__item-title">{provider.name}</span>
          {provider.verified && (
            <span className="badge--verified new-items__verified">인증</span>
          )}
        </span>
        <span className="new-items__item-meta new-items__item-meta--spaced">
          {provider.tagline} · {provider.region}
        </span>
      </span>
    </Link>
  );
}
