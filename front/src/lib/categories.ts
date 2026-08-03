/**
 * 서비스 카테고리의 단일 출처(single source of truth).
 * 오픈 시 카테고리 4개 (CLAUDE.md "초기 범위는 좁게" 원칙).
 *
 * 네비 링크가 아니라 도메인 데이터(목록 필터 기준)로 사용한다.
 * 추후 백엔드 연동 시 이 id가 category slug로 그대로 쓰인다.
 */

export const CATEGORIES = [
  { id: "cleaning", label: "청소" },
  { id: "interior", label: "인테리어" },
  { id: "painting", label: "페인트·도장" },
  { id: "web-design", label: "웹·디자인 제작" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

/** searchParams 등 외부 입력 문자열이 유효한 카테고리 id인지 검증한다. */
export function isCategoryId(value: string | undefined): value is CategoryId {
  return CATEGORIES.some((c) => c.id === value);
}

/** 카테고리 id → 표시용 라벨. */
export function getCategoryLabel(id: CategoryId): string {
  // isCategoryId로 검증된 id만 들어오므로 항상 존재한다.
  return CATEGORIES.find((c) => c.id === id)!.label;
}
