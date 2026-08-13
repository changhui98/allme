import { getCategoryLabel } from "@/lib/categories";
import type { RequestPost } from "@/lib/mock/request-posts";

/**
 * "해주세요" 목록의 요청 카드 (서버 컴포넌트).
 * 상세 페이지가 아직 없어 링크 없이 정보만 렌더한다.
 * 스타일: styles/pages/board.css
 */
export default function RequestCard({ post }: { post: RequestPost }) {
  return (
    <article className="card card--interactive request-card">
      <div className="request-card__head">
        <span className="pill">{getCategoryLabel(post.category)}</span>
        <span className="request-card__date">{post.createdAt}</span>
      </div>

      <div>
        <h2 className="request-card__title">{post.title}</h2>
        <p className="request-card__meta">
          {post.authorNickname} · {post.region}
        </p>
      </div>

      <dl className="request-card__facts">
        <dt className="request-card__fact-label">희망 일정</dt>
        <dd className="request-card__fact-value">{post.preferredSchedule}</dd>
        <dt className="request-card__fact-label">예산</dt>
        <dd className="request-card__budget">{post.budget}</dd>
      </dl>

      <p className="request-card__proposals">
        받은 제안{" "}
        <span className="request-card__proposal-count">
          {post.proposalCount}건
        </span>
      </p>
    </article>
  );
}
