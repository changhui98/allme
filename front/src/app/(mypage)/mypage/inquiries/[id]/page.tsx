import type { Metadata } from "next";
import Link from "next/link";
import MyInquiryDetail from "@/components/mypage/MyInquiryDetail";

export const metadata: Metadata = { title: "문의 상세" };

export default async function MypageInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mypage-column">
      <Link href="/mypage/inquiries" className="support-back support-back--above">
        ← 내 문의
      </Link>
      <h1 className="mypage-page__title">문의 상세</h1>
      <p className="mypage-page__subtitle">보낸 문의와 답변 내용이에요.</p>
      <MyInquiryDetail id={Number(id)} />
    </div>
  );
}
