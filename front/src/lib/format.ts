/** 시작가(원)를 "15만원~" 형태로 포맷한다. 만원 미만 단위는 천 단위 콤마로 표기. */
export function formatPriceFrom(price: number): string {
  if (price >= 10_000 && price % 10_000 === 0) {
    return `${(price / 10_000).toLocaleString("ko-KR")}만원~`;
  }
  return `${price.toLocaleString("ko-KR")}원~`;
}

/** ISO 일시("2026-08-26T14:30:12")를 "2026.08.26"으로 — 목록 날짜 표기 공용 */
export function formatDate(iso: string): string {
  return iso.slice(0, 10).replaceAll("-", ".");
}

/** ISO 일시를 "2026.08.26 14:30"으로 — 상세 화면의 처리·답변 시각 표기 */
export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} ${iso.slice(11, 16)}`;
}
