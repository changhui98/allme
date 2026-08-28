import Link from "next/link";
import { getCategoryByCode } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { formatRegion } from "@/lib/regions";
import {
  formatBudget,
  formatSchedule,
  type OpenServiceRequestSummary,
} from "@/lib/service-requests";

/**
 * "해주세요" 목록의 요청 카드 — 공개 상세(/requests/[id])로 가는 링크.
 * 모바일 플랫 리스트 오버라이드(board.css)가 .request-card에 걸리므로 카드 클래스는 링크 자체에 둔다.
 * 스타일: styles/pages/board.css
 */
export default function RequestCard({ post }: { post: OpenServiceRequestSummary }) {
  return (
    <Link href={`/requests/${post.id}`} className="card card--interactive request-card">
      <div className="request-card__head">
        <span className="pill">{getCategoryByCode(post.category).label}</span>
        <span className="request-card__date">{formatDate(post.createdDate)}</span>
      </div>

      <div className="request-card__body">
        <h2 className="request-card__title">{post.title}</h2>
        <p className="request-card__meta">
          {post.authorNickname ?? "탈퇴한 회원"} · {formatRegion(post.region)}
        </p>
      </div>

      <dl className="request-card__facts">
        <dt className="request-card__fact-label">희망 일정</dt>
        <dd className="request-card__fact-value">
          {formatSchedule(post.preferredDate, post.scheduleNegotiable)}
        </dd>
        <dt className="request-card__fact-label">예산</dt>
        <dd className="request-card__budget">
          {formatBudget(post.budgetMin, post.budgetMax, post.budgetNegotiable)}
        </dd>
      </dl>

      <p className="request-card__proposals">
        받은 제안{" "}
        <span className="request-card__proposal-count">{post.proposalCount}건</span>
      </p>
    </Link>
  );
}
