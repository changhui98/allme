/**
 * 정산 계좌 은행 목록 — code는 백엔드 user 도메인 Bank enum name과의 계약이다.
 * 항목 추가·삭제 시 백엔드 Bank와 반드시 함께 맞출 것.
 * shortName은 은행 선택 그리드(BankPickerModal)의 라벨 전용 — 계약 아님.
 * 아이콘은 public/banks/{code 소문자}.svg (출처·라이선스: public/banks/README.md).
 */
export const BANKS = [
  { code: "KB", name: "KB국민은행", shortName: "KB국민" },
  { code: "SHINHAN", name: "신한은행", shortName: "신한" },
  { code: "WOORI", name: "우리은행", shortName: "우리" },
  { code: "HANA", name: "하나은행", shortName: "하나" },
  { code: "NH", name: "NH농협은행", shortName: "NH농협" },
  { code: "IBK", name: "IBK기업은행", shortName: "IBK기업" },
  { code: "SC", name: "SC제일은행", shortName: "SC제일" },
  { code: "CITI", name: "한국씨티은행", shortName: "씨티" },
  { code: "KAKAO", name: "카카오뱅크", shortName: "카카오뱅크" },
  { code: "TOSS", name: "토스뱅크", shortName: "토스뱅크" },
  { code: "KBANK", name: "케이뱅크", shortName: "케이뱅크" },
  { code: "POST", name: "우체국", shortName: "우체국" },
  { code: "SAEMAUL", name: "새마을금고", shortName: "새마을금고" },
  { code: "SHINHYUP", name: "신협", shortName: "신협" },
  { code: "SUHYUP", name: "수협은행", shortName: "수협" },
  { code: "BUSAN", name: "부산은행", shortName: "부산" },
  { code: "IM", name: "iM뱅크", shortName: "iM뱅크" },
  { code: "GWANGJU", name: "광주은행", shortName: "광주" },
  { code: "JEONBUK", name: "전북은행", shortName: "전북" },
  { code: "JEJU", name: "제주은행", shortName: "제주" },
  { code: "KYONGNAM", name: "경남은행", shortName: "경남" },
] as const;

export type BankCode = (typeof BANKS)[number]["code"];

/** 은행 원형 CI 아이콘 경로 — 파일명 규칙은 code 소문자 고정 */
export function bankIconSrc(code: string): string {
  return `/banks/${code.toLowerCase()}.svg`;
}
