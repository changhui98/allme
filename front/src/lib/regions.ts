/**
 * 요청 지역 상수 — 오픈 지역인 서울 25개 자치구 + 온라인(지역 무관).
 * id는 백엔드 Region enum name과 같은 API 계약이고, 라벨은 여기서만 관리한다(FaqCategory와 같은 관례).
 * ONLINE은 현장 방문이 필요 없는 카테고리(categories.ts requiresSite === false)에서만 고를 수 있다.
 */
export const REGIONS = [
  { id: "GANGNAM", label: "강남구" },
  { id: "GANGDONG", label: "강동구" },
  { id: "GANGBUK", label: "강북구" },
  { id: "GANGSEO", label: "강서구" },
  { id: "GWANAK", label: "관악구" },
  { id: "GWANGJIN", label: "광진구" },
  { id: "GURO", label: "구로구" },
  { id: "GEUMCHEON", label: "금천구" },
  { id: "NOWON", label: "노원구" },
  { id: "DOBONG", label: "도봉구" },
  { id: "DONGDAEMUN", label: "동대문구" },
  { id: "DONGJAK", label: "동작구" },
  { id: "MAPO", label: "마포구" },
  { id: "SEODAEMUN", label: "서대문구" },
  { id: "SEOCHO", label: "서초구" },
  { id: "SEONGDONG", label: "성동구" },
  { id: "SEONGBUK", label: "성북구" },
  { id: "SONGPA", label: "송파구" },
  { id: "YANGCHEON", label: "양천구" },
  { id: "YEONGDEUNGPO", label: "영등포구" },
  { id: "YONGSAN", label: "용산구" },
  { id: "EUNPYEONG", label: "은평구" },
  { id: "JONGNO", label: "종로구" },
  { id: "JUNG", label: "중구" },
  { id: "JUNGNANG", label: "중랑구" },
  { id: "ONLINE", label: "온라인·지역 무관" },
] as const;

export type RegionId = (typeof REGIONS)[number]["id"];

export const ONLINE_REGION: RegionId = "ONLINE";

/** 서울 25개 자치구 id — 지역 복수 선택(RegionPicker)의 전체 선택·표시 기준 */
export const SEOUL_GU_IDS: RegionId[] = REGIONS.filter((r) => r.id !== ONLINE_REGION).map(
  (r) => r.id,
);

export const REGION_LABEL: Record<RegionId, string> = Object.fromEntries(
  REGIONS.map((r) => [r.id, r.label]),
) as Record<RegionId, string>;

/** 지역 id → 표시 문구. 구는 "서울 관악구", 온라인은 라벨 그대로. */
export function formatRegion(id: RegionId): string {
  return id === ONLINE_REGION ? REGION_LABEL[id] : `서울 ${REGION_LABEL[id]}`;
}
