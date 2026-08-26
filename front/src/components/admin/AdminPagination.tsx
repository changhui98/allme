"use client";

/**
 * 관리자 목록 공용 이전/다음 페이지네이션 — 목록마다 같은 마크업을 반복하지 않기 위한 추출.
 * page는 0부터. totalPages가 1 이하이면 아무것도 그리지 않는다.
 * 스타일: styles/pages/admin.css(admin-pagination)
 */
export default function AdminPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="admin-pagination">
      <button
        type="button"
        className="btn btn--outline admin-pagination__btn"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        이전
      </button>
      <span className="admin-pagination__info">
        {page + 1} / {totalPages} 페이지
      </span>
      <button
        type="button"
        className="btn btn--outline admin-pagination__btn"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        다음
      </button>
    </div>
  );
}
