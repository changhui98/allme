import type { CategoryId } from "@/lib/categories";

/**
 * 목업 업체(p1…) 전용 서비스 데이터 — 목업 업체 상세 페이지(/providers/p1…)의 "제공 서비스" 섹션에서만 쓴다.
 * 해드려요 목록(/services)·홈 인기 서비스는 listing 도메인 공개 API(lib/provider-services.ts)로 전환됐다.
 * 실제 업체(회원 id) 페이지가 자리를 잡으면 목업 업체와 함께 제거한다.
 */

export type ServicePost = {
  id: string;
  category: CategoryId;
  /** 서비스 제목 (예: "원룸·오피스텔 입주청소 전문") */
  title: string;
  /** providers.ts의 Provider.id와 동기화 (상호 import 금지 — 조인은 페이지에서) */
  providerId: string;
  /** 목록 카드가 업체 조회 없이 렌더하도록 비정규화해 둔 업체명 */
  providerName: string;
  /** MVP는 표시용 문자열. 지역 코드 정규화는 백엔드 설계 때 처리 */
  region: string;
  /** 시작가(원). 표시는 "15만원~" 형태로 포맷 */
  priceFrom: number;
  rating: number;
  reviewCount: number;
  /** 작업 소요 기간 표시용 문자열 (예: "3~4시간", "4~6주") */
  duration: string;
  /** 카드용 한 줄 소개 */
  description: string;
};

const SERVICE_POSTS: ServicePost[] = [
  {
    id: "s1",
    category: "cleaning",
    title: "원룸·오피스텔 입주청소 전문",
    providerId: "p1",
    providerName: "반짝홈클린",
    region: "서울 강남·서초",
    priceFrom: 150_000,
    rating: 4.8,
    reviewCount: 127,
    duration: "3~4시간",
    description: "10년 경력 팀이 새집처럼 만들어 드립니다. 당일 견적 가능.",
  },
  {
    id: "s2",
    category: "cleaning",
    title: "이사·거주 청소 올인원 패키지",
    providerId: "p2",
    providerName: "클린메이트",
    region: "서울 전 지역",
    priceFrom: 200_000,
    rating: 4.6,
    reviewCount: 84,
    duration: "반나절~1일",
    description: "이사 전후 청소를 한 번에. 곰팡이·찌든 때 특수 케어 포함.",
  },
  {
    id: "s3",
    category: "cleaning",
    title: "사무실 정기 청소 (주 1회~)",
    providerId: "p1",
    providerName: "반짝홈클린",
    region: "서울 마포·영등포",
    priceFrom: 90_000,
    rating: 4.9,
    reviewCount: 56,
    duration: "회당 2~3시간",
    description: "소규모 사무실 전문. 새벽·주말 방문으로 업무에 지장 없이.",
  },
  {
    id: "s4",
    category: "interior",
    title: "아파트 전체 리모델링 시공",
    providerId: "p3",
    providerName: "공간을짓다",
    region: "서울 송파·강동",
    priceFrom: 15_000_000,
    rating: 4.7,
    reviewCount: 43,
    duration: "4~6주",
    description: "설계부터 시공까지 원스톱. 3D 시안으로 미리 확인하세요.",
  },
  {
    id: "s5",
    category: "interior",
    title: "주방·욕실 부분 인테리어",
    providerId: "p4",
    providerName: "무드스튜디오",
    region: "서울 노원·도봉",
    priceFrom: 3_500_000,
    rating: 4.5,
    reviewCount: 31,
    duration: "1~2주",
    description: "부분 시공 전문이라 합리적인 가격. 자재 등급별 견적 제공.",
  },
  {
    id: "s6",
    category: "interior",
    title: "카페·매장 상업 공간 인테리어",
    providerId: "p4",
    providerName: "무드스튜디오",
    region: "서울 전 지역",
    priceFrom: 20_000_000,
    rating: 4.8,
    reviewCount: 22,
    duration: "5~8주",
    description: "브랜딩까지 고려한 상업 공간 설계. 오픈 일정에 맞춰 시공.",
  },
  {
    id: "s7",
    category: "painting",
    title: "아파트 내부 도장·도배",
    providerId: "p5",
    providerName: "새벽페인팅",
    region: "서울 강서·양천",
    priceFrom: 800_000,
    rating: 4.6,
    reviewCount: 68,
    duration: "2~4일",
    description: "친환경 페인트 사용. 가구 보양 작업 꼼꼼하게 해드립니다.",
  },
  {
    id: "s8",
    category: "painting",
    title: "상가 외벽 도장 전문",
    providerId: "p6",
    providerName: "탑코트",
    region: "서울 전 지역",
    priceFrom: 2_000_000,
    rating: 4.4,
    reviewCount: 19,
    duration: "3~7일",
    description: "고소 작업 자격 보유. 방수 도장 동시 시공 가능.",
  },
  {
    id: "s9",
    category: "painting",
    title: "셀프 인테리어용 부분 도장",
    providerId: "p5",
    providerName: "새벽페인팅",
    region: "서울 성동·광진",
    priceFrom: 300_000,
    rating: 4.9,
    reviewCount: 41,
    duration: "반나절~1일",
    description: "방 하나부터 가능한 소규모 도장. 색상 컨설팅 무료.",
  },
  {
    id: "s10",
    category: "web-design",
    title: "반응형 홈페이지 제작 (기획~배포)",
    providerId: "p7",
    providerName: "픽셀워크스",
    region: "서울 (온라인 협업 가능)",
    priceFrom: 1_500_000,
    rating: 4.7,
    reviewCount: 52,
    duration: "4~6주",
    description: "소상공인 홈페이지 전문. 유지보수 3개월 무상 포함.",
  },
  {
    id: "s11",
    category: "web-design",
    title: "쇼핑몰 구축 + 브랜드 디자인",
    providerId: "p8",
    providerName: "그리드랩",
    region: "서울 (온라인 협업 가능)",
    priceFrom: 4_000_000,
    rating: 4.8,
    reviewCount: 36,
    duration: "6~8주",
    description: "로고·상세페이지·쇼핑몰까지 브랜드 톤을 통일해 제작합니다.",
  },
  {
    id: "s12",
    category: "web-design",
    title: "랜딩페이지 초고속 제작 (7일)",
    providerId: "p7",
    providerName: "픽셀워크스",
    region: "서울 (온라인 협업 가능)",
    priceFrom: 700_000,
    rating: 4.5,
    reviewCount: 28,
    duration: "7일",
    description: "이벤트·출시용 랜딩페이지를 일주일 안에. 수정 2회 포함.",
  },
];

/**
 * 카테고리 미지정 시 전체 목록을 반환한다.
 * query는 제목·설명·업체명에 대한 대소문자 무시 부분 일치 검색.
 */
export function getServicePosts(
  category?: CategoryId,
  query?: string,
): ServicePost[] {
  let posts = category
    ? SERVICE_POSTS.filter((p) => p.category === category)
    : SERVICE_POSTS;
  const keyword = query?.trim().toLowerCase();
  if (keyword) {
    posts = posts.filter((p) =>
      [p.title, p.description, p.providerName].some((text) =>
        text.toLowerCase().includes(keyword),
      ),
    );
  }
  return posts;
}

/** 리뷰 많은 순 상위 limit개 — 랜딩 "인기 서비스" 섹션용. */
export function getPopularServicePosts(limit: number): ServicePost[] {
  return [...SERVICE_POSTS]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

/** 특정 업체가 등록한 서비스 목록. 업체 상세 페이지에서 사용한다. */
export function getServicePostsByProvider(providerId: string): ServicePost[] {
  return SERVICE_POSTS.filter((p) => p.providerId === providerId);
}
