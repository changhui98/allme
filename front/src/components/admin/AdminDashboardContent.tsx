"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchApplications,
  fetchDashboardSummary,
  type AdminDashboardSummary,
  type ProviderApplicationSummary,
} from "@/lib/admin";

/**
 * 관리자 대시보드 — 풀폭 스탯 로우 + 대기 중 신청 최근 5건 미니 테이블.
 * 대기 신청은 심사 동선의 시작점이라 대시보드에서 바로 상세로 진입할 수 있게 한다.
 */
export default function AdminDashboardContent() {
  const router = useRouter();
  const [result, setResult] = useState<{
    summary?: AdminDashboardSummary;
    pending?: ProviderApplicationSummary[];
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchDashboardSummary(),
      fetchApplications({ status: "PENDING", page: 0, size: 5 }),
    ])
      .then(([summary, pendingPage]) => {
        if (!cancelled) setResult({ summary, pending: pendingPage.content });
      })
      .catch((e: Error) => {
        if (!cancelled) setResult({ error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (result?.error) return <p className="admin-error">{result.error}</p>;
  if (!result?.summary) return <p className="admin-loading">불러오는 중…</p>;

  const { summary, pending = [] } = result;

  return (
    <>
      <div className="admin-stats">
        <Link href="/admin/users" className="admin-stats__item">
          <span className="admin-stats__label">전체 회원</span>
          <span className="admin-stats__value">{summary.activeUserCount}</span>
        </Link>
        <div className="admin-stats__item">
          <span className="admin-stats__label">업체 수</span>
          <span className="admin-stats__value">{summary.providerCount}</span>
        </div>
        <Link
          href="/admin/applications?status=PENDING"
          className="admin-stats__item"
        >
          <span className="admin-stats__label">대기 중 신청</span>
          <span
            className={`admin-stats__value${
              summary.pendingApplicationCount > 0
                ? " admin-stats__value--attention"
                : ""
            }`}
          >
            {summary.pendingApplicationCount}
          </span>
        </Link>
        <Link href="/admin/applications" className="admin-stats__item">
          <span className="admin-stats__label">누적 신청</span>
          <span className="admin-stats__value">
            {summary.totalApplicationCount}
          </span>
        </Link>
        <Link
          href="/admin/service/inquiries?status=PENDING"
          className="admin-stats__item"
        >
          <span className="admin-stats__label">답변 대기 문의</span>
          <span
            className={`admin-stats__value${
              summary.pendingInquiryCount > 0
                ? " admin-stats__value--attention"
                : ""
            }`}
          >
            {summary.pendingInquiryCount}
          </span>
        </Link>
      </div>

      <section aria-label="대기 중 신청" className="admin-mini">
        <div className="admin-mini__head">
          <h2 className="admin-mini__title">대기 중 신청</h2>
          <Link
            href="/admin/applications?status=PENDING"
            className="admin-mini__more"
          >
            전체 보기 →
          </Link>
        </div>

        {pending.length === 0 ? (
          <p className="admin-mini__empty">
            심사를 기다리는 신청이 없어요. 새 신청이 들어오면 여기에 표시돼요.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">업체명</th>
                  <th scope="col">신청자</th>
                  <th scope="col" className="admin-table__num">
                    신청일
                  </th>
                </tr>
              </thead>
              <tbody>
                {pending.map((application) => (
                  <tr
                    key={application.id}
                    className="admin-table__row--link"
                    onClick={() =>
                      router.push(`/admin/applications/${application.id}`)
                    }
                  >
                    <td>
                      <Link
                        href={`/admin/applications/${application.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="admin-table__primary"
                      >
                        {application.businessName}
                      </Link>
                    </td>
                    <td className="admin-table__muted">
                      {application.applicantLoginId}
                    </td>
                    <td className="admin-table__num">
                      {application.createdDate.slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
