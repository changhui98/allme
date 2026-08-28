/**
 * 서비스 카테고리의 단일 출처(single source of truth).
 * 오픈 시 카테고리 4개 (CLAUDE.md "초기 범위는 좁게" 원칙).
 * 네비 링크가 아니라 도메인 데이터(목록 필터 기준)로 사용한다.
 * - id: URL 슬러그(/requests?category=web-design) — 백엔드 ServiceCategory.slug와 같은 값
 * - code: API 계약(백엔드 ServiceCategory enum name) — 요청 등록·응답에 쓴다
 * - requiresSite: 현장 방문형 여부 — 요청 폼에서 상세 주소를 받고, 지역 "온라인"을 막는다
 * - unitLabel: 작업 규모 단위(현장형 평수 / 웹·디자인 페이지 수)
 */
export const CATEGORIES = [
  { id: "cleaning", code: "CLEANING", label: "청소", requiresSite: true, unitLabel: "평" },
  { id: "interior", code: "INTERIOR", label: "인테리어", requiresSite: true, unitLabel: "평" },
  { id: "painting", code: "PAINTING", label: "페인트·도장", requiresSite: true, unitLabel: "평" },
  { id: "web-design", code: "WEB_DESIGN", label: "웹·디자인 제작", requiresSite: false, unitLabel: "페이지" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

/** 백엔드 ServiceCategory enum name */
export type ServiceCategoryCode = (typeof CATEGORIES)[number]["code"];

export type Category = (typeof CATEGORIES)[number];

/** searchParams 등 외부 입력 문자열이 유효한 카테고리 id인지 검증한다. */
export function isCategoryId(value: string | undefined): value is CategoryId {
  return CATEGORIES.some((c) => c.id === value);
}

/** 카테고리 id → 표시용 라벨. */
export function getCategoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)!.label;
}

/** API 계약 code → 카테고리 정의. 서버 응답의 category 문자열을 라벨·단위로 바꿀 때 쓴다. */
export function getCategoryByCode(code: ServiceCategoryCode): Category {
  return CATEGORIES.find((c) => c.code === code)!;
}
