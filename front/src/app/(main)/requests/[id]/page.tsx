import type { Metadata } from "next";
import RequestDetail from "@/components/board/RequestDetail";

export const metadata: Metadata = { title: "요청 상세" };

/** 해주세요 공개 상세 — 업체가 내용을 보고 제안한다. 본문은 클라이언트에서 불러온다. 스타일: styles/pages/board.css */
export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="page-container board-page request-page">
      <RequestDetail id={Number(id)} />
    </main>
  );
}
