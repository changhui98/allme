import type { Metadata } from "next";
import NoticeForm from "@/components/admin/NoticeForm";

export const metadata: Metadata = { title: "공지 등록" };

export default function AdminNoticeNewPage() {
  return (
    <div className="mypage-column">
      <h1 className="mypage-page__title">공지 등록</h1>
      <p className="mypage-page__subtitle">새 공지를 작성해요. 비공개로 저장해 두었다가 나중에 공개할 수도 있어요.</p>
      <NoticeForm />
    </div>
  );
}
