import type { CategoryId } from "@/lib/categories";

/**
 * "해주세요" 목록의 목업 데이터.
 * 백엔드가 아직 없어 프론트 상수로 둔다 — API 연동 시 getRequestPosts 내부만
 * fetch로 교체하면 페이지 코드는 그대로 유지된다.
 *
 * 예산·일정은 MVP에선 표시용 자유 문자열로 두고,
 * 숫자 정규화(시세 데이터 적재)는 백엔드 설계 때 처리한다.
 */

export type RequestPost = {
  id: string;
  category: CategoryId;
  /** 요청 제목 (예: "24평 아파트 이사 전 도배·페인트") */
  title: string;
  authorNickname: string;
  region: string;
  /** 희망 일정 (예: "8월 중순" / "협의 가능") */
  preferredSchedule: string;
  /** 예산 (예: "50~80만원" / "제안 받아요") */
  budget: string;
  /** 작성일 (YYYY-MM-DD) — 목록 정렬·표시용 */
  createdAt: string;
  /** 받은 제안 수 */
  proposalCount: number;
};

const REQUEST_POSTS: RequestPost[] = [
  {
    id: "r1",
    category: "cleaning",
    title: "이사 나가기 전 원상복구 청소 필요해요",
    authorNickname: "이사준비중",
    region: "서울 관악구",
    preferredSchedule: "8월 둘째 주",
    budget: "15~20만원",
    createdAt: "2026-08-01",
    proposalCount: 4,
  },
  {
    id: "r2",
    category: "cleaning",
    title: "신축 입주 전 새집 청소 부탁드립니다 (34평)",
    authorNickname: "새집마련",
    region: "서울 강동구",
    preferredSchedule: "8월 20일 전후",
    budget: "30만원 내외",
    createdAt: "2026-07-30",
    proposalCount: 7,
  },
  {
    id: "r3",
    category: "cleaning",
    title: "에어컨 3대 분해 청소 해주실 분",
    authorNickname: "여름나기",
    region: "서울 동작구",
    preferredSchedule: "협의 가능",
    budget: "제안 받아요",
    createdAt: "2026-07-28",
    proposalCount: 2,
  },
  {
    id: "r4",
    category: "interior",
    title: "24평 아파트 이사 전 도배·페인트 + 주방 교체",
    authorNickname: "리모델링고민",
    region: "서울 은평구",
    preferredSchedule: "9월 초",
    budget: "800~1,200만원",
    createdAt: "2026-08-01",
    proposalCount: 5,
  },
  {
    id: "r5",
    category: "interior",
    title: "10평 카페 창업 인테리어 견적 문의",
    authorNickname: "예비사장님",
    region: "서울 마포구",
    preferredSchedule: "10월 오픈 목표",
    budget: "2,000~3,000만원",
    createdAt: "2026-07-29",
    proposalCount: 9,
  },
  {
    id: "r6",
    category: "interior",
    title: "베란다 확장부 단열 보강하고 싶어요",
    authorNickname: "겨울대비",
    region: "서울 노원구",
    preferredSchedule: "9월 중",
    budget: "200~300만원",
    createdAt: "2026-07-25",
    proposalCount: 3,
  },
  {
    id: "r7",
    category: "painting",
    title: "거실+방 2개 벽면 도장 (곰팡이 제거 포함)",
    authorNickname: "화이트톤",
    region: "서울 성북구",
    preferredSchedule: "8월 말",
    budget: "80~120만원",
    createdAt: "2026-07-31",
    proposalCount: 6,
  },
  {
    id: "r8",
    category: "painting",
    title: "매장 셔터·간판 주변 도장 새로 하고 싶습니다",
    authorNickname: "골목가게",
    region: "서울 중구",
    preferredSchedule: "협의 가능",
    budget: "제안 받아요",
    createdAt: "2026-07-27",
    proposalCount: 1,
  },
  {
    id: "r9",
    category: "painting",
    title: "빌라 옥상 방수 페인트 시공 문의",
    authorNickname: "장마걱정",
    region: "서울 강북구",
    preferredSchedule: "8월 중순",
    budget: "150만원 내외",
    createdAt: "2026-07-26",
    proposalCount: 4,
  },
  {
    id: "r10",
    category: "web-design",
    title: "공방 소개 홈페이지 만들어주실 분 찾아요",
    authorNickname: "가죽공방지기",
    region: "서울 (온라인 협업 희망)",
    preferredSchedule: "9월 완성 목표",
    budget: "100~150만원",
    createdAt: "2026-08-02",
    proposalCount: 8,
  },
  {
    id: "r11",
    category: "web-design",
    title: "스마트스토어 상세페이지 디자인 10종",
    authorNickname: "온라인셀러",
    region: "서울 (온라인 협업 희망)",
    preferredSchedule: "8월 내",
    budget: "60~80만원",
    createdAt: "2026-07-30",
    proposalCount: 5,
  },
  {
    id: "r12",
    category: "web-design",
    title: "동호회 모임 예약 웹사이트 제작 (간단한 기능)",
    authorNickname: "테니스클럽",
    region: "서울 (온라인 협업 희망)",
    preferredSchedule: "협의 가능",
    budget: "제안 받아요",
    createdAt: "2026-07-24",
    proposalCount: 2,
  },
];

/** 카테고리 미지정 시 전체 목록을 반환한다. 최신 작성일 순으로 정렬. */
export function getRequestPosts(category?: CategoryId): RequestPost[] {
  const posts = category
    ? REQUEST_POSTS.filter((p) => p.category === category)
    : REQUEST_POSTS;
  return [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
