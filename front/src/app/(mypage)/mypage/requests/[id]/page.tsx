import type { Metadata } from "next";
import Link from "next/link";
import MyServiceRequestDetail from "@/components/mypage/MyServiceRequestDetail";

export const metadata: Metadata = { title: "요청 상세" };

export default async function MypageRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mypage-column">
      <Link href="/mypage/requests" className="support-back support-back--above">
        ← 요청한 서비스
      </Link>
      <h1 className="mypage-page__title">요청 상세</h1>
      <p className="mypage-page__subtitle">등록한 요청 내용이에요.</p>
      <MyServiceRequestDetail id={Number(id)} />
    </div>
  );
}
