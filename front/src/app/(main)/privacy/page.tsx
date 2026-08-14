import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";
import { PRIVACY_DOC } from "@/lib/legal/privacy";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "올미가 개인정보 보호법에 따라 수립·공개하는 개인정보처리방침. 개인정보의 처리 목적·항목·보유 기간, 위탁, 정보주체의 권리와 행사 방법을 안내합니다.",
};

/**
 * 개인정보처리방침 — Footer의 /privacy 링크가 가리키는 법적 필수 페이지.
 * 방침 전문은 lib/legal/privacy.ts 데이터로 분리했고, 여기서는 주입만 한다.
 */
export default function PrivacyPage() {
  return <LegalDocument doc={PRIVACY_DOC} />;
}
