import type { Metadata } from "next";
import Link from "next/link";
import FaqForm from "@/components/admin/FaqForm";

export const metadata: Metadata = { title: "FAQ 수정" };

export default async function AdminFaqEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mypage-column">
      <Link href="/admin/service/faqs" className="admin-back">
        ← 목록으로
      </Link>
      <h1 className="mypage-page__title">FAQ 수정</h1>
      <p className="mypage-page__subtitle">내용을 고치거나 분류·순서·공개 여부를 바꿔요.</p>
      <FaqForm id={Number(id)} />
    </div>
  );
}
