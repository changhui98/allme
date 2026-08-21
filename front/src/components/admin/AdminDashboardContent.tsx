"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchDashboardSummary,
  type AdminDashboardSummary,
} from "@/lib/admin";

/** 관리자 대시보드 — 요약 숫자 타일(mypage-stats 재사용). 대기 신청 타일은 심사 목록으로 연결. */
export default function AdminDashboardContent() {
  const [result, setResult] = useState<{
    summary?: AdminDashboardSummary;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDashboardSummary()
      .then((summary) => {
        if (!cancelled) setResult({ summary });
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

  const summary = result.summary;

  return (
    <div className="mypage-stats">
      <Link href="/admin/users" className="mypage-stats__item">
        <span className="mypage-stats__label">전체 회원</span>
        <span className="mypage-stats__value">{summary.activeUserCount}</span>
      </Link>
      <div className="mypage-stats__item">
        <span className="mypage-stats__label">업체 수</span>
        <span className="mypage-stats__value">{summary.providerCount}</span>
      </div>
      <Link
        href="/admin/applications?status=PENDING"
        className="mypage-stats__item"
      >
        <span className="mypage-stats__label">대기 중 신청</span>
        <span className="mypage-stats__value">
          {summary.pendingApplicationCount}
        </span>
      </Link>
      <Link href="/admin/applications" className="mypage-stats__item">
        <span className="mypage-stats__label">누적 신청</span>
        <span className="mypage-stats__value">
          {summary.totalApplicationCount}
        </span>
      </Link>
    </div>
  );
}
