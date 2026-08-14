import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";
import { TERMS_DOC } from "@/lib/legal/terms";

export const metadata: Metadata = {
  title: "이용약관",
  description:
    "올미 통합 서비스 마켓플레이스 이용약관. 회원, 서비스 제공, 안전결제(에스크로)·구매확정·정산 등 거래 조건과 회사·회원의 권리와 의무를 안내합니다.",
};

/**
 * 이용약관 — Footer의 /terms 링크가 가리키는 법적 필수 페이지.
 * 약관 전문은 lib/legal/terms.ts 데이터로 분리했고, 여기서는 주입만 한다.
 */
export default function TermsPage() {
  return <LegalDocument doc={TERMS_DOC} />;
}
