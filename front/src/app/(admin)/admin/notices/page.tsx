import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import NoticeList from "@/components/admin/NoticeList";

export const metadata: Metadata = { title: "공지사항" };

/** 공지사항 관리 — 목록·필터는 클라이언트(useSearchParams라 Suspense 필요) */
export default function AdminNoticesPage() {
  return (
    <>
      <div className="admin-page__head">
        <div>
          <h1 className="mypage-page__title">공지사항</h1>
          <p className="mypage-page__subtitle">
            공개한 공지는 클라이언트 공지사항 페이지에 바로 보여요.
          </p>
        </div>
        <Link href="/admin/notices/new" className="btn btn--primary admin-page__action">
          새 공지
        </Link>
      </div>
      <Suspense fallback={<p className="admin-loading">불러오는 중…</p>}>
        <NoticeList />
      </Suspense>
    </>
  );
}
