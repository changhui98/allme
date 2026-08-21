import type { Metadata } from "next";
import ApplicationDetail from "@/components/admin/ApplicationDetail";

export const metadata: Metadata = { title: "신청 상세" };

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <h1 className="mypage-page__title">업체 신청 상세</h1>
      <p className="mypage-page__subtitle">
        신청 내용을 확인하고 승인 또는 반려해요.
      </p>
      <ApplicationDetail id={Number(id)} />
    </>
  );
}
