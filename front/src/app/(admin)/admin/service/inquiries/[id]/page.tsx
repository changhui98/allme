import type { Metadata } from "next";
import Link from "next/link";
import InquiryDetail from "@/components/admin/InquiryDetail";

export const metadata: Metadata = { title: "문의 상세" };

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    // 마이페이지 공통 문법 — 52rem 가운데 컬럼 안에 그룹 + hairline 행(카드 없음)
    <div className="mypage-column">
      <Link href="/admin/service/inquiries" className="admin-back">
        ← 목록으로
      </Link>
      <h1 className="mypage-page__title">문의 상세</h1>
      <p className="mypage-page__subtitle">문의 내용을 확인하고 답변을 남겨요.</p>
      <InquiryDetail id={Number(id)} />
    </div>
  );
}
