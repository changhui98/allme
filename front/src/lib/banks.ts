/**
 * 정산 계좌 은행 목록 — code는 백엔드 user 도메인 Bank enum name과의 계약이다.
 * 항목 추가·삭제 시 백엔드 Bank와 반드시 함께 맞출 것.
 */
export const BANKS = [
  { code: "KB", name: "KB국민은행" },
  { code: "SHINHAN", name: "신한은행" },
  { code: "WOORI", name: "우리은행" },
  { code: "HANA", name: "하나은행" },
  { code: "NH", name: "NH농협은행" },
  { code: "IBK", name: "IBK기업은행" },
  { code: "SC", name: "SC제일은행" },
  { code: "CITI", name: "한국씨티은행" },
  { code: "KAKAO", name: "카카오뱅크" },
  { code: "TOSS", name: "토스뱅크" },
  { code: "KBANK", name: "케이뱅크" },
  { code: "POST", name: "우체국" },
  { code: "SAEMAUL", name: "새마을금고" },
  { code: "SHINHYUP", name: "신협" },
  { code: "SUHYUP", name: "수협은행" },
  { code: "BUSAN", name: "부산은행" },
  { code: "IM", name: "iM뱅크" },
  { code: "GWANGJU", name: "광주은행" },
  { code: "JEONBUK", name: "전북은행" },
  { code: "JEJU", name: "제주은행" },
  { code: "KYONGNAM", name: "경남은행" },
] as const;

export type BankCode = (typeof BANKS)[number]["code"];
