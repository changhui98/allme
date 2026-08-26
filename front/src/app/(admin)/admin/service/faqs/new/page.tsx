import type { Metadata } from "next";
import Link from "next/link";
import FaqForm from "@/components/admin/FaqForm";

export const metadata: Metadata = { title: "FAQ 등록" };

export default function AdminFaqNewPage() {
  return (
    <div className="mypage-column">
      <Link href="/admin/service/faqs" className="admin-back">
        ← 목록으로
      </Link>
      <h1 className="mypage-page__title">FAQ 등록</h1>
      <p className="mypage-page__subtitle">질문과 답변을 작성하고 분류·노출 순서를 정해요.</p>
      <FaqForm />
    </div>
  );
}
