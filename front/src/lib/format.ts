/** 시작가(원)를 "15만원~" 형태로 포맷한다. 만원 미만 단위는 천 단위 콤마로 표기. */
export function formatPriceFrom(price: number): string {
  if (price >= 10_000 && price % 10_000 === 0) {
    return `${(price / 10_000).toLocaleString("ko-KR")}만원~`;
  }
  return `${price.toLocaleString("ko-KR")}원~`;
}
