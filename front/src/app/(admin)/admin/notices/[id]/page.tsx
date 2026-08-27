import type { Metadata } from "next";
import NoticeForm from "@/components/admin/NoticeForm";

export const metadata: Metadata = { title: "공지 수정" };

export default async function AdminNoticeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mypage-column">
      <h1 className="mypage-page__title">공지 수정</h1>
      <p className="mypage-page__subtitle">내용을 고치거나 공개 여부·상단 고정을 바꿔요.</p>
      <NoticeForm id={Number(id)} />
    </div>
  );
}
