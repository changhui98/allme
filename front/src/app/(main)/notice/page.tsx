import type { Metadata } from "next";
import { Suspense } from "react";
import NoticeList from "@/components/support/NoticeList";
import SupportPageHead from "@/components/support/SupportPageHead";

export const metadata: Metadata = {
  title: "공지사항",
  description: "올미의 새로운 소식과 안내를 확인하세요.",
};

/** 공지사항 목록 — 목록은 클라이언트(useSearchParams라 Suspense 필요). 스타일: styles/pages/support.css */
export default function NoticePage() {
  return (
    <main className="page-container board-page">
      <SupportPageHead
        title="공지사항"
        description="올미의 새로운 소식과 안내를 확인하세요."
      />
      <Suspense fallback={<p className="board-page__empty">불러오는 중…</p>}>
        <NoticeList />
      </Suspense>
    </main>
  );
}
