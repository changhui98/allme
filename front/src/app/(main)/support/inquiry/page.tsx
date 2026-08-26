import type { Metadata } from "next";
import InquiryForm from "@/components/support/InquiryForm";
import SupportPageHead from "@/components/support/SupportPageHead";

export const metadata: Metadata = { title: "1:1 문의" };

/** 1:1 문의 작성 — 공통 헤딩 + 가운데 폼(로그인 가드는 InquiryForm). 스타일: styles/pages/support.css */
export default function InquiryPage() {
  return (
    <main className="page-container board-page">
      <SupportPageHead
        title="1:1 문의"
        description="이용 중 불편한 점이나 궁금한 점을 남겨주세요. 답변은 마이페이지 내 문의에서 확인할 수 있어요."
      />
      <InquiryForm />
    </main>
  );
}
