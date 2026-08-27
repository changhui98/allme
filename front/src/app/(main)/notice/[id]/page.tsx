import type { Metadata } from "next";
import NoticeDetail from "@/components/support/NoticeDetail";

export const metadata: Metadata = { title: "공지사항" };

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="page-container board-page support-page">
      <NoticeDetail id={Number(id)} />
    </main>
  );
}
