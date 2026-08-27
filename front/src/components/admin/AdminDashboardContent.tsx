"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchAdminInquiries,
  fetchApplications,
  fetchDashboardSummary,
  type AdminDashboardSummary,
  type AdminInquirySummary,
  type ProviderApplicationSummary,
} from "@/lib/admin";
import { formatDate } from "@/lib/format";

/**
 * 관리자 대시보드 — hairline 스탯 스트립(링크 항목만 이동 문구) + 처리 대기 항목(업체 신청·1:1 문의) 최근 5건 미니 테이블.
 * 대기 신청은 심사 동선의 시작점이라 대시보드에서 바로 상세로 진입할 수 있게 한다.
 */
export default function AdminDashboardContent() {
  const router = useRouter();
  const [result, setResult] = useState<{
    summary?: AdminDashboardSummary;
    pending?: ProviderApplicationSummary[];
    pendingInquiries?: AdminInquirySummary[];
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchDashboardSummary(),
      fetchApplications({ status: "PENDING", page: 0, size: 5 }),
      fetchAdminInquiries({ status: "PENDING", page: 0, size: 5 }),
    ])
      .then(([summary, pendingPage, inquiryPage]) => {
        if (!cancelled) {
          setResult({
            summary,
            pending: pendingPage.content,
            pendingInquiries: inquiryPage.content,
          });
        }
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

  const { summary, pending = [], pendingInquiries = [] } = result;

  // 링크(href)가 있는 항목만 이동 가능 — 각 목록의 필터 상태로 바로 진입
  const stats: {
    label: string;
    value: number;
    href?: string;
    action?: string;
    attention?: boolean;
  }[] = [
    {
      label: "전체 회원",
      value: summary.activeUserCount,
      href: "/admin/users",
      action: "회원 목록 →",
    },
    {
      label: "업체 수",
      value: summary.providerCount,
      href: "/admin/users?role=PROVIDER",
      action: "업체 목록 →",
    },
    {
      label: "대기 중 신청",
      value: summary.pendingApplicationCount,
      href: "/admin/providers/applications?status=PENDING",
      action: "심사하기 →",
      attention: summary.pendingApplicationCount > 0,
    },
    {
      label: "누적 신청",
      value: summary.totalApplicationCount,
      href: "/admin/providers/applications",
      action: "신청 목록 →",
    },
    {
      label: "답변 대기 문의",
      value: summary.pendingInquiryCount,
      href: "/admin/service/inquiries?status=PENDING",
      action: "답변하기 →",
      attention: summary.pendingInquiryCount > 0,
    },
  ];

  return (
    <>
      {/* hairline 스트립 — 링크 항목만 "… →" 문구·hover 배경으로 클릭 가능을 드러낸다 */}
      <div className="admin-stats">
        {stats.map((stat) => {
          const inner = (
            <>
              <span className="admin-stats__label">{stat.label}</span>
              <span
                className={`admin-stats__value${
                  stat.attention ? " admin-stats__value--attention" : ""
                }`}
              >
                {stat.value}
              </span>
              {stat.href && (
                <span className="admin-stats__action">{stat.action}</span>
              )}
            </>
          );
          return stat.href ? (
            <Link
              key={stat.label}
              href={stat.href}
              className="admin-stats__item admin-stats__item--link"
            >
              {inner}
            </Link>
          ) : (
            <div key={stat.label} className="admin-stats__item">
              {inner}
            </div>
          );
        })}
      </div>

      <section aria-label="대기 중 신청" className="admin-mini">
        <div className="admin-mini__head">
          <h2 className="admin-mini__title">대기 중 신청</h2>
          <Link
            href="/admin/providers/applications?status=PENDING"
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
                      router.push(
                        `/admin/providers/applications/${application.id}`,
                      )
                    }
                  >
                    <td>
                      <Link
                        href={`/admin/providers/applications/${application.id}`}
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
                      {formatDate(application.createdDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-label="답변 대기 문의" className="admin-mini">
        <div className="admin-mini__head">
          <h2 className="admin-mini__title">답변 대기 문의</h2>
          <Link
            href="/admin/service/inquiries?status=PENDING"
            className="admin-mini__more"
          >
            전체 보기 →
          </Link>
        </div>

        {pendingInquiries.length === 0 ? (
          <p className="admin-mini__empty">
            답변을 기다리는 문의가 없어요. 새 문의가 들어오면 여기에 표시돼요.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">제목</th>
                  <th scope="col">작성자</th>
                  <th scope="col" className="admin-table__num">
                    작성일
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingInquiries.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    className="admin-table__row--link"
                    onClick={() =>
                      router.push(`/admin/service/inquiries/${inquiry.id}`)
                    }
                  >
                    <td>
                      <Link
                        href={`/admin/service/inquiries/${inquiry.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="admin-table__primary"
                      >
                        {inquiry.title}
                      </Link>
                    </td>
                    <td className="admin-table__muted">
                      {inquiry.authorLoginId}
                    </td>
                    <td className="admin-table__num">
                      {formatDate(inquiry.createdDate)}
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
