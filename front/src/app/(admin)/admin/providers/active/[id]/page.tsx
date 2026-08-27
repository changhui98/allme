import type { Metadata } from "next";
import ProviderDetail from "@/components/admin/ProviderDetail";

export const metadata: Metadata = { title: "업체 상세" };

export default async function AdminActiveProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    // 마이페이지 공통 문법 — 52rem 가운데 컬럼 안에 그룹 + hairline 행(카드 없음)
    <div className="mypage-column">
      <h1 className="mypage-page__title">업체 상세</h1>
      <p className="mypage-page__subtitle">
        업체 정보를 확인하고 필요하면 자격을 해제해요.
      </p>
      <ProviderDetail userId={Number(id)} />
    </div>
  );
}
