import type { Metadata } from "next";
import Link from "next/link";
import FaqList from "@/components/support/FaqList";
import SupportPageHead from "@/components/support/SupportPageHead";

export const metadata: Metadata = {
  title: "자주 묻는 질문",
  description: "올미 이용 중 자주 묻는 질문과 답변을 모았어요.",
};

/** FAQ — 공통 헤딩 + 분류 탭 + 아코디언. 스타일: styles/pages/support.css */
export default function FaqPage() {
  return (
    <main className="page-container board-page support-page">
      <SupportPageHead
        title="자주 묻는 질문"
        description={
          <>
            궁금한 점을 먼저 찾아보세요. 답을 찾지 못했다면{" "}
            <Link href="/support/inquiry" className="board-page__result-query">
              1:1 문의
            </Link>
            로 알려주세요.
          </>
        }
      />
      <FaqList />
    </main>
  );
}
