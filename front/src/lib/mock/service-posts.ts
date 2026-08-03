import type { CategoryId } from "@/lib/categories";

/**
 * "해드려요" 목록의 목업 데이터.
 * 백엔드가 아직 없어 프론트 상수로 둔다 — API 연동 시 getServicePosts 내부만
 * fetch로 교체하면 페이지 코드는 그대로 유지된다.
 */

export type ServicePost = {
  id: string;
  category: CategoryId;
  /** 서비스 제목 (예: "원룸·오피스텔 입주청소 전문") */
  title: string;
  providerName: string;
  /** MVP는 표시용 문자열. 지역 코드 정규화는 백엔드 설계 때 처리 */
  region: string;
  /** 시작가(원). 표시는 "15만원~" 형태로 포맷 */
  priceFrom: number;
  rating: number;
  reviewCount: number;
  /** 카드용 한 줄 소개 */
  description: string;
};

const SERVICE_POSTS: ServicePost[] = [
  {
    id: "s1",
    category: "cleaning",
    title: "원룸·오피스텔 입주청소 전문",
    providerName: "반짝홈클린",
    region: "서울 강남·서초",
    priceFrom: 150_000,
    rating: 4.8,
    reviewCount: 127,
    description: "10년 경력 팀이 새집처럼 만들어 드립니다. 당일 견적 가능.",
  },
  {
    id: "s2",
    category: "cleaning",
    title: "이사·거주 청소 올인원 패키지",
    providerName: "클린메이트",
    region: "서울 전 지역",
    priceFrom: 200_000,
    rating: 4.6,
    reviewCount: 84,
    description: "이사 전후 청소를 한 번에. 곰팡이·찌든 때 특수 케어 포함.",
  },
  {
    id: "s3",
    category: "cleaning",
    title: "사무실 정기 청소 (주 1회~)",
    providerName: "오피스케어",
    region: "서울 마포·영등포",
    priceFrom: 90_000,
    rating: 4.9,
    reviewCount: 56,
    description: "소규모 사무실 전문. 새벽·주말 방문으로 업무에 지장 없이.",
  },
  {
    id: "s4",
    category: "interior",
    title: "아파트 전체 리모델링 시공",
    providerName: "공간을짓다",
    region: "서울 송파·강동",
    priceFrom: 15_000_000,
    rating: 4.7,
    reviewCount: 43,
    description: "설계부터 시공까지 원스톱. 3D 시안으로 미리 확인하세요.",
  },
  {
    id: "s5",
    category: "interior",
    title: "주방·욕실 부분 인테리어",
    providerName: "리브인테리어",
    region: "서울 노원·도봉",
    priceFrom: 3_500_000,
    rating: 4.5,
    reviewCount: 31,
    description: "부분 시공 전문이라 합리적인 가격. 자재 등급별 견적 제공.",
  },
  {
    id: "s6",
    category: "interior",
    title: "카페·매장 상업 공간 인테리어",
    providerName: "무드스튜디오",
    region: "서울 전 지역",
    priceFrom: 20_000_000,
    rating: 4.8,
    reviewCount: 22,
    description: "브랜딩까지 고려한 상업 공간 설계. 오픈 일정에 맞춰 시공.",
  },
  {
    id: "s7",
    category: "painting",
    title: "아파트 내부 도장·도배",
    providerName: "새벽페인팅",
    region: "서울 강서·양천",
    priceFrom: 800_000,
    rating: 4.6,
    reviewCount: 68,
    description: "친환경 페인트 사용. 가구 보양 작업 꼼꼼하게 해드립니다.",
  },
  {
    id: "s8",
    category: "painting",
    title: "상가 외벽 도장 전문",
    providerName: "탑코트",
    region: "서울 전 지역",
    priceFrom: 2_000_000,
    rating: 4.4,
    reviewCount: 19,
    description: "고소 작업 자격 보유. 방수 도장 동시 시공 가능.",
  },
  {
    id: "s9",
    category: "painting",
    title: "셀프 인테리어용 부분 도장",
    providerName: "컬러핸즈",
    region: "서울 성동·광진",
    priceFrom: 300_000,
    rating: 4.9,
    reviewCount: 41,
    description: "방 하나부터 가능한 소규모 도장. 색상 컨설팅 무료.",
  },
  {
    id: "s10",
    category: "web-design",
    title: "반응형 홈페이지 제작 (기획~배포)",
    providerName: "픽셀워크스",
    region: "서울 (온라인 협업 가능)",
    priceFrom: 1_500_000,
    rating: 4.7,
    reviewCount: 52,
    description: "소상공인 홈페이지 전문. 유지보수 3개월 무상 포함.",
  },
  {
    id: "s11",
    category: "web-design",
    title: "쇼핑몰 구축 + 브랜드 디자인",
    providerName: "그리드랩",
    region: "서울 (온라인 협업 가능)",
    priceFrom: 4_000_000,
    rating: 4.8,
    reviewCount: 36,
    description: "로고·상세페이지·쇼핑몰까지 브랜드 톤을 통일해 제작합니다.",
  },
  {
    id: "s12",
    category: "web-design",
    title: "랜딩페이지 초고속 제작 (7일)",
    providerName: "런치패드",
    region: "서울 (온라인 협업 가능)",
    priceFrom: 700_000,
    rating: 4.5,
    reviewCount: 28,
    description: "이벤트·출시용 랜딩페이지를 일주일 안에. 수정 2회 포함.",
  },
];

/** 카테고리 미지정 시 전체 목록을 반환한다. */
export function getServicePosts(category?: CategoryId): ServicePost[] {
  if (!category) return SERVICE_POSTS;
  return SERVICE_POSTS.filter((p) => p.category === category);
}
