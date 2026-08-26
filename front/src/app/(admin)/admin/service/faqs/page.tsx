import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import FaqList from "@/components/admin/FaqList";

export const metadata: Metadata = { title: "FAQ" };

/** FAQ 관리 — 목록·필터는 클라이언트(useSearchParams라 Suspense 필요) */
export default function AdminFaqsPage() {
  return (
    <>
      <div className="admin-page__head">
        <div>
          <h1 className="mypage-page__title">FAQ</h1>
          <p className="mypage-page__subtitle">
            자주 묻는 질문을 관리해요. 공개한 항목은 클라이언트 FAQ 페이지에 보여요.
          </p>
        </div>
        <Link href="/admin/service/faqs/new" className="btn btn--primary admin-page__action">
          새 FAQ
        </Link>
      </div>
      <Suspense fallback={<p className="admin-loading">불러오는 중…</p>}>
        <FaqList />
      </Suspense>
    </>
  );
}
