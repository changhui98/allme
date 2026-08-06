import type { CategoryId } from "@/lib/categories";

/**
 * 업체(공급자) 목업 데이터.
 * 백엔드가 아직 없어 프론트 상수로 둔다 — API 연동 시 getter 내부만
 * fetch로 교체하면 페이지 코드는 그대로 유지된다.
 *
 * service-posts.ts와의 정합성 규칙:
 * - id는 ServicePost.providerId가 참조한다 (상호 import 금지 — 조인은 페이지에서).
 * - rating은 보유 서비스 rating의 대략적 평균, reviewCount는 보유 서비스 합 이하.
 * - reviews 배열은 "최근 리뷰"만 담으므로 reviewCount보다 적을 수 있다.
 */

export type PortfolioItem = {
  id: string;
  /** 예: "역삼동 오피스텔 입주청소" */
  title: string;
  /** 한 줄 설명 */
  summary: string;
  category: CategoryId;
  /** 이미지 스토리지가 없어 그라데이션 배경으로 대체. 흰 텍스트 오버레이 전제로 어두운 톤만 사용 */
  themeClass: string;
};

export type ProviderReview = {
  id: string;
  /** 실데이터 마스킹은 백엔드 처리 — 목업은 마스킹된 값을 저장한다 (예: "김*진") */
  authorMasked: string;
  /** 1~5 정수 */
  rating: number;
  content: string;
  /** "YYYY-MM-DD" 표시용 문자열 */
  date: string;
  /** 어떤 서비스에 대한 리뷰인지 (선택) */
  serviceTitle?: string;
};

export type Provider = {
  id: string;
  /** 상호 */
  name: string;
  /** 짧은 소개 — 히어로·metadata description용 */
  tagline: string;
  /** 긴 소개 — 문단 배열로 두고 p 태그에 매핑 */
  bio: string[];
  /** 활동 분야. 인테리어+도장 겸업 등 복수 허용 */
  categories: CategoryId[];
  /** MVP는 표시용 문자열. 지역 코드 정규화는 백엔드 설계 때 처리 */
  region: string;
  /** 마스킹된 표시용 사업자등록번호: "XXX-XX-***XX" 형식 통일 */
  businessRegistrationMasked: string;
  /** 사업자 진위 확인(국세청 API) 통과 여부 */
  verified: boolean;
  /** 플랫폼 가입일 (YYYY-MM-DD) — "새로 합류한 업체" 정렬·표시용 */
  joinedAt: string;
  rating: number;
  reviewCount: number;
  /** 응답률(%) */
  responseRate: number;
  /** 경력 연차 */
  careerYears: number;
  /** 플랫폼 거래 완료 건수 */
  completedCount: number;
  /** 아바타(이니셜) 배경 그라데이션 — 흰 글자 전제로 어두운 톤만 사용 */
  avatarClass: string;
  portfolio: PortfolioItem[];
  reviews: ProviderReview[];
};

const PROVIDERS: Provider[] = [
  {
    id: "p1",
    name: "반짝홈클린",
    tagline: "10년 경력 팀의 꼼꼼한 입주·사무실 청소",
    bio: [
      "반짝홈클린은 강남·서초를 중심으로 10년째 입주청소와 사무실 정기 청소를 전문으로 하고 있습니다. 자체 교육을 마친 정규 팀원만 현장에 투입하며, 작업 전 체크리스트를 고객과 함께 확인한 뒤 시작합니다.",
      "새집증후군 케어를 위한 친환경 약품을 기본으로 사용하고, 작업 후에는 구역별 완료 사진을 보내드립니다. 재청소 요청은 완료 후 3일 이내 무상으로 처리합니다.",
    ],
    categories: ["cleaning"],
    region: "서울 강남·서초 외",
    businessRegistrationMasked: "211-86-***42",
    verified: true,
    joinedAt: "2026-05-02",
    rating: 4.8,
    reviewCount: 180,
    responseRate: 98,
    careerYears: 10,
    completedCount: 1240,
    avatarClass: "bg-gradient-to-br from-sky-700 to-cyan-600",
    portfolio: [
      {
        id: "p1-w1",
        title: "역삼동 오피스텔 입주청소",
        summary: "24평 · 새집증후군 케어 포함",
        category: "cleaning",
        themeClass: "bg-gradient-to-br from-sky-800 to-cyan-700",
      },
      {
        id: "p1-w2",
        title: "서초 신축 아파트 34평 입주청소",
        summary: "베란다 곰팡이 방지 시공 병행",
        category: "cleaning",
        themeClass: "bg-gradient-to-br from-cyan-800 to-sky-600",
      },
      {
        id: "p1-w3",
        title: "마포 공유오피스 정기 청소",
        summary: "주 2회 새벽 방문 · 6개월 계약",
        category: "cleaning",
        themeClass: "bg-gradient-to-br from-slate-700 to-sky-700",
      },
    ],
    reviews: [
      {
        id: "p1-r1",
        authorMasked: "김*진",
        rating: 5,
        content:
          "입주 전날 급하게 예약했는데도 시간 맞춰 와주셨어요. 싱크대 안쪽까지 반짝반짝합니다.",
        date: "2026-07-21",
        serviceTitle: "원룸·오피스텔 입주청소 전문",
      },
      {
        id: "p1-r2",
        authorMasked: "이*영",
        rating: 5,
        content:
          "완료 사진을 구역별로 보내주셔서 믿음이 갔어요. 창틀 먼지까지 완벽했습니다.",
        date: "2026-07-10",
        serviceTitle: "원룸·오피스텔 입주청소 전문",
      },
      {
        id: "p1-r3",
        authorMasked: "박*수",
        rating: 4,
        content:
          "사무실 정기 청소 3개월째인데 만족합니다. 새벽 방문이라 업무에 지장이 전혀 없어요.",
        date: "2026-06-28",
        serviceTitle: "사무실 정기 청소 (주 1회~)",
      },
      {
        id: "p1-r4",
        authorMasked: "최*아",
        rating: 5,
        content: "곰팡이 제거를 걱정했는데 흔적도 없이 처리해주셨습니다.",
        date: "2026-06-15",
        serviceTitle: "원룸·오피스텔 입주청소 전문",
      },
      {
        id: "p1-r5",
        authorMasked: "정*호",
        rating: 4,
        content:
          "견적 문의 답장이 빨라서 좋았어요. 다음 이사 때도 이용할 생각입니다.",
        date: "2026-05-30",
      },
    ],
  },
  {
    id: "p2",
    name: "클린메이트",
    tagline: "이사 전후 청소를 한 번에, 특수 케어까지",
    bio: [
      "클린메이트는 이사·거주 청소 올인원 패키지를 운영합니다. 이사 전 빈집 청소와 이사 후 정리 청소를 하나의 일정으로 묶어, 고객이 두 번 예약할 필요가 없도록 했습니다.",
      "곰팡이·찌든 때 특수 케어는 전담 장비를 보유한 팀이 직접 진행하며, 서울 전 지역 당일 견적이 가능합니다.",
    ],
    categories: ["cleaning"],
    region: "서울 전 지역",
    businessRegistrationMasked: "105-27-***81",
    verified: true,
    joinedAt: "2026-06-14",
    rating: 4.6,
    reviewCount: 84,
    responseRate: 92,
    careerYears: 6,
    completedCount: 520,
    avatarClass: "bg-gradient-to-br from-teal-700 to-emerald-600",
    portfolio: [
      {
        id: "p2-w1",
        title: "은평 빌라 이사 올인원 패키지",
        summary: "이사 전후 청소 + 곰팡이 케어",
        category: "cleaning",
        themeClass: "bg-gradient-to-br from-teal-800 to-emerald-700",
      },
      {
        id: "p2-w2",
        title: "동작 아파트 거주 청소",
        summary: "주방 찌든 때 특수 케어 집중",
        category: "cleaning",
        themeClass: "bg-gradient-to-br from-emerald-800 to-teal-600",
      },
      {
        id: "p2-w3",
        title: "관악 원룸 퇴거 청소",
        summary: "보증금 반환용 원상복구 청소",
        category: "cleaning",
        themeClass: "bg-gradient-to-br from-slate-700 to-teal-700",
      },
    ],
    reviews: [
      {
        id: "p2-r1",
        authorMasked: "한*림",
        rating: 5,
        content:
          "이사 전후를 한 번에 맡기니 정말 편했어요. 일정 조율도 알아서 해주셨습니다.",
        date: "2026-07-18",
        serviceTitle: "이사·거주 청소 올인원 패키지",
      },
      {
        id: "p2-r2",
        authorMasked: "오*석",
        rating: 4,
        content: "욕실 곰팡이가 심했는데 새것처럼 됐습니다. 가격도 합리적이에요.",
        date: "2026-07-02",
        serviceTitle: "이사·거주 청소 올인원 패키지",
      },
      {
        id: "p2-r3",
        authorMasked: "서*연",
        rating: 5,
        content: "당일 견적 받고 이틀 뒤 바로 작업. 진행이 빨라서 좋았습니다.",
        date: "2026-06-20",
      },
      {
        id: "p2-r4",
        authorMasked: "임*규",
        rating: 4,
        content: "꼼꼼하게 해주셨어요. 다만 예약이 몰리는 주말은 서둘러야 해요.",
        date: "2026-06-05",
      },
    ],
  },
  {
    id: "p3",
    name: "공간을짓다",
    tagline: "설계부터 시공까지, 리모델링 원스톱 파트너",
    bio: [
      "공간을짓다는 아파트 전체 리모델링을 설계-자재-시공-감리까지 원스톱으로 진행합니다. 계약 전 3D 시안으로 완성된 모습을 미리 확인할 수 있어, 시공 후 이견이 생기지 않도록 합니다.",
      "도장·도배 전담 팀을 자체 보유하고 있어 인테리어와 도장을 한 계약으로 묶을 수 있는 것이 강점입니다. 모든 현장은 주 단위 공정표를 공유합니다.",
    ],
    categories: ["interior", "painting"],
    region: "서울 송파·강동",
    businessRegistrationMasked: "220-81-***17",
    verified: true,
    joinedAt: "2026-05-27",
    rating: 4.7,
    reviewCount: 43,
    responseRate: 88,
    careerYears: 15,
    completedCount: 210,
    avatarClass: "bg-gradient-to-br from-stone-700 to-orange-800",
    portfolio: [
      {
        id: "p3-w1",
        title: "잠실 아파트 34평 전체 리모델링",
        summary: "구조 변경 + 주방 확장 · 6주 시공",
        category: "interior",
        themeClass: "bg-gradient-to-br from-stone-800 to-orange-900",
      },
      {
        id: "p3-w2",
        title: "강동 구축 아파트 올수리",
        summary: "25년차 구축 · 배관 교체 포함",
        category: "interior",
        themeClass: "bg-gradient-to-br from-orange-900 to-amber-800",
      },
      {
        id: "p3-w3",
        title: "송파 아파트 전체 도장·도배",
        summary: "리모델링 연계 친환경 도장",
        category: "painting",
        themeClass: "bg-gradient-to-br from-amber-900 to-stone-700",
      },
      {
        id: "p3-w4",
        title: "위례 신혼집 인테리어",
        summary: "3D 시안 그대로 구현한 사례",
        category: "interior",
        themeClass: "bg-gradient-to-br from-stone-700 to-amber-800",
      },
    ],
    reviews: [
      {
        id: "p3-r1",
        authorMasked: "윤*태",
        rating: 5,
        content:
          "3D 시안과 완성본이 거의 똑같아서 놀랐습니다. 공정표 공유 덕분에 진행 상황을 계속 알 수 있었어요.",
        date: "2026-07-12",
        serviceTitle: "아파트 전체 리모델링 시공",
      },
      {
        id: "p3-r2",
        authorMasked: "강*희",
        rating: 5,
        content: "구축 아파트라 걱정이 많았는데 배관까지 깔끔하게 정리해주셨습니다.",
        date: "2026-06-25",
        serviceTitle: "아파트 전체 리모델링 시공",
      },
      {
        id: "p3-r3",
        authorMasked: "조*민",
        rating: 4,
        content:
          "자재 등급별로 견적을 나눠서 주셔서 예산 조정이 쉬웠어요. 일정도 약속대로 지켜졌습니다.",
        date: "2026-06-08",
      },
      {
        id: "p3-r4",
        authorMasked: "신*우",
        rating: 4,
        content: "도장까지 한 번에 계약하니 업체 조율 스트레스가 없었습니다.",
        date: "2026-05-19",
      },
    ],
  },
  {
    id: "p4",
    name: "무드스튜디오",
    tagline: "브랜딩까지 고려한 주거·상업 공간 디자인",
    bio: [
      "무드스튜디오는 '공간의 분위기'를 먼저 설계하는 인테리어 스튜디오입니다. 카페·매장 등 상업 공간은 브랜드 아이덴티티 분석부터 시작해 간판·가구·조명까지 하나의 톤으로 완성합니다.",
      "주방·욕실 부분 시공 전문 팀을 별도로 운영해, 전체 공사가 부담스러운 고객도 합리적인 가격으로 원하는 공간만 바꿀 수 있습니다.",
    ],
    categories: ["interior"],
    region: "서울 전 지역",
    businessRegistrationMasked: "144-88-***29",
    verified: true,
    joinedAt: "2026-07-08",
    rating: 4.7,
    reviewCount: 53,
    responseRate: 95,
    careerYears: 9,
    completedCount: 180,
    avatarClass: "bg-gradient-to-br from-stone-700 to-amber-700",
    portfolio: [
      {
        id: "p4-w1",
        title: "성수 카페 '모노톤' 신규 오픈",
        summary: "브랜딩 연계 · 45평 상업 공간",
        category: "interior",
        themeClass: "bg-gradient-to-br from-stone-800 to-amber-800",
      },
      {
        id: "p4-w2",
        title: "노원 아파트 주방 리뉴얼",
        summary: "ㄷ자 주방 확장 · 2주 시공",
        category: "interior",
        themeClass: "bg-gradient-to-br from-amber-900 to-orange-800",
      },
      {
        id: "p4-w3",
        title: "연남동 브런치 매장 리뉴얼",
        summary: "운영 중단 없이 야간 시공",
        category: "interior",
        themeClass: "bg-gradient-to-br from-zinc-700 to-stone-600",
      },
      {
        id: "p4-w4",
        title: "도봉 욕실 전체 교체",
        summary: "방수 재시공 포함 · 5일 완료",
        category: "interior",
        themeClass: "bg-gradient-to-br from-stone-700 to-zinc-600",
      },
    ],
    reviews: [
      {
        id: "p4-r1",
        authorMasked: "백*현",
        rating: 5,
        content:
          "카페 오픈 일정이 빠듯했는데 약속한 날짜에 정확히 끝내주셨어요. 손님들이 인테리어 칭찬을 정말 많이 합니다.",
        date: "2026-07-25",
        serviceTitle: "카페·매장 상업 공간 인테리어",
      },
      {
        id: "p4-r2",
        authorMasked: "유*나",
        rating: 5,
        content: "주방만 바꿨는데 집 전체 분위기가 달라졌어요. 자재 설명이 상세했습니다.",
        date: "2026-07-07",
        serviceTitle: "주방·욕실 부분 인테리어",
      },
      {
        id: "p4-r3",
        authorMasked: "노*준",
        rating: 4,
        content: "브랜드 톤에 맞춘 조명 제안이 인상적이었습니다. 소통이 빨라요.",
        date: "2026-06-18",
        serviceTitle: "카페·매장 상업 공간 인테리어",
      },
      {
        id: "p4-r4",
        authorMasked: "황*솔",
        rating: 4,
        content: "욕실 방수까지 다시 잡아주셔서 안심됐습니다.",
        date: "2026-06-01",
        serviceTitle: "주방·욕실 부분 인테리어",
      },
      {
        id: "p4-r5",
        authorMasked: "문*경",
        rating: 5,
        content: "견적 단계에서 등급별 옵션을 표로 정리해주셔서 결정이 쉬웠어요.",
        date: "2026-05-22",
      },
    ],
  },
  {
    id: "p5",
    name: "새벽페인팅",
    tagline: "친환경 도장 전문, 색상 컨설팅 무료",
    bio: [
      "새벽페인팅은 친환경 인증 페인트만 사용하는 도장 전문 업체입니다. 아파트 내부 도장·도배부터 방 하나 단위의 소규모 부분 도장까지, 규모와 무관하게 동일한 보양 기준으로 작업합니다.",
      "시공 전 무료 색상 컨설팅으로 조명·가구와 어울리는 컬러를 제안해 드리며, 작업 후 남은 페인트는 보수용으로 밀봉해 드립니다.",
    ],
    categories: ["painting"],
    region: "서울 강서·양천 외",
    businessRegistrationMasked: "109-14-***56",
    verified: true,
    joinedAt: "2026-06-30",
    rating: 4.7,
    reviewCount: 105,
    responseRate: 97,
    careerYears: 12,
    completedCount: 860,
    avatarClass: "bg-gradient-to-br from-emerald-800 to-teal-600",
    portfolio: [
      {
        id: "p5-w1",
        title: "목동 아파트 전체 도장·도배",
        summary: "32평 · 친환경 페인트 · 4일",
        category: "painting",
        themeClass: "bg-gradient-to-br from-emerald-900 to-teal-700",
      },
      {
        id: "p5-w2",
        title: "성수 원룸 포인트 도장",
        summary: "침실 한 면 포인트 컬러 시공",
        category: "painting",
        themeClass: "bg-gradient-to-br from-teal-800 to-emerald-600",
      },
      {
        id: "p5-w3",
        title: "강서 상가 내부 도장",
        summary: "영업 종료 후 야간 작업 진행",
        category: "painting",
        themeClass: "bg-gradient-to-br from-slate-700 to-emerald-700",
      },
    ],
    reviews: [
      {
        id: "p5-r1",
        authorMasked: "장*빈",
        rating: 5,
        content:
          "가구 보양을 정말 꼼꼼하게 해주셔서 페인트 얼룩 걱정이 없었어요. 냄새도 거의 안 납니다.",
        date: "2026-07-19",
        serviceTitle: "아파트 내부 도장·도배",
      },
      {
        id: "p5-r2",
        authorMasked: "송*이",
        rating: 5,
        content:
          "색상 컨설팅이 무료라길래 반신반의했는데, 추천해주신 색이 딱이었어요.",
        date: "2026-07-04",
        serviceTitle: "셀프 인테리어용 부분 도장",
      },
      {
        id: "p5-r3",
        authorMasked: "권*형",
        rating: 4,
        content: "방 하나만 맡겼는데도 성의 있게 해주셨습니다. 남은 페인트도 챙겨주셨어요.",
        date: "2026-06-22",
        serviceTitle: "셀프 인테리어용 부분 도장",
      },
      {
        id: "p5-r4",
        authorMasked: "안*리",
        rating: 5,
        content: "도배와 도장을 같이 진행해서 일정이 짧아졌습니다. 마감이 깔끔해요.",
        date: "2026-06-10",
        serviceTitle: "아파트 내부 도장·도배",
      },
      {
        id: "p5-r5",
        authorMasked: "홍*표",
        rating: 4,
        content: "견적 회신이 빨랐고 추가 비용 없이 견적대로 끝났습니다.",
        date: "2026-05-27",
      },
    ],
  },
  {
    id: "p6",
    name: "탑코트",
    tagline: "외벽 도장·방수 동시 시공 전문",
    bio: [
      "탑코트는 상가·건물 외벽 도장을 전문으로 하는 팀입니다. 전 작업자가 고소 작업 자격을 보유하고 있으며, 균열 보수와 방수 도장을 한 공정으로 묶어 발판 설치 비용을 아낄 수 있습니다.",
      "기상 조건에 따른 일정 변경 기준을 계약서에 명시해, 공기 지연 분쟁이 없도록 운영합니다.",
    ],
    categories: ["painting"],
    region: "서울 전 지역",
    businessRegistrationMasked: "138-45-***03",
    verified: true,
    joinedAt: "2026-05-15",
    rating: 4.4,
    reviewCount: 19,
    responseRate: 85,
    careerYears: 18,
    completedCount: 140,
    avatarClass: "bg-gradient-to-br from-slate-700 to-blue-800",
    portfolio: [
      {
        id: "p6-w1",
        title: "구로 5층 상가 외벽 도장",
        summary: "균열 보수 + 방수 동시 시공",
        category: "painting",
        themeClass: "bg-gradient-to-br from-slate-800 to-blue-900",
      },
      {
        id: "p6-w2",
        title: "영등포 빌딩 옥상 방수 도장",
        summary: "우레탄 방수 · 10년 보증",
        category: "painting",
        themeClass: "bg-gradient-to-br from-blue-900 to-slate-700",
      },
      {
        id: "p6-w3",
        title: "금천 공장 외벽 재도장",
        summary: "주말 작업으로 조업 중단 없이",
        category: "painting",
        themeClass: "bg-gradient-to-br from-zinc-700 to-blue-800",
      },
    ],
    reviews: [
      {
        id: "p6-r1",
        authorMasked: "구*철",
        rating: 5,
        content:
          "외벽 균열 때문에 골치였는데 보수와 도장을 한 번에 끝내주셨습니다. 견적도 항목별로 투명했어요.",
        date: "2026-07-08",
        serviceTitle: "상가 외벽 도장 전문",
      },
      {
        id: "p6-r2",
        authorMasked: "남*영",
        rating: 4,
        content: "장마철이라 일정이 몇 번 밀렸지만 기준대로 미리 알려주셔서 괜찮았습니다.",
        date: "2026-06-24",
        serviceTitle: "상가 외벽 도장 전문",
      },
      {
        id: "p6-r3",
        authorMasked: "라*원",
        rating: 4,
        content: "방수 보증서를 서면으로 주셔서 믿음이 갑니다.",
        date: "2026-05-31",
      },
      {
        id: "p6-r4",
        authorMasked: "표*진",
        rating: 4,
        content: "고소 작업인데도 안전 관리가 철저해 보였습니다.",
        date: "2026-05-12",
      },
    ],
  },
  {
    id: "p7",
    name: "픽셀워크스",
    tagline: "소상공인 홈페이지·랜딩페이지 제작 전문",
    bio: [
      "픽셀워크스는 소상공인을 위한 웹사이트를 기획부터 배포까지 책임지는 웹 에이전시입니다. 반응형은 기본이고, 검색 노출(SEO)을 고려한 구조 설계로 '만들고 끝'이 아닌 '찾아오는 홈페이지'를 만듭니다.",
      "출시 일정이 급한 고객을 위한 7일 랜딩페이지 패키지를 별도로 운영하며, 모든 프로젝트에 유지보수 3개월 무상이 포함됩니다.",
    ],
    categories: ["web-design"],
    region: "서울 (온라인 협업 가능)",
    businessRegistrationMasked: "774-87-***90",
    verified: true,
    joinedAt: "2026-07-21",
    rating: 4.6,
    reviewCount: 78,
    responseRate: 99,
    careerYears: 7,
    completedCount: 310,
    avatarClass: "bg-gradient-to-br from-indigo-800 to-violet-600",
    portfolio: [
      {
        id: "p7-w1",
        title: "베이커리 '밀앤버터' 홈페이지",
        summary: "예약 폼 + 지도 연동 · 4주",
        category: "web-design",
        themeClass: "bg-gradient-to-br from-indigo-900 to-violet-700",
      },
      {
        id: "p7-w2",
        title: "헬스장 오픈 랜딩페이지",
        summary: "7일 패키지 · 사전등록 320건",
        category: "web-design",
        themeClass: "bg-gradient-to-br from-violet-800 to-purple-700",
      },
      {
        id: "p7-w3",
        title: "법률사무소 반응형 홈페이지",
        summary: "상담 신청 흐름 중심 설계",
        category: "web-design",
        themeClass: "bg-gradient-to-br from-slate-700 to-indigo-800",
      },
      {
        id: "p7-w4",
        title: "공방 클래스 예약 사이트",
        summary: "클래스 일정표 + 결제 링크 연동",
        category: "web-design",
        themeClass: "bg-gradient-to-br from-purple-900 to-indigo-700",
      },
    ],
    reviews: [
      {
        id: "p7-r1",
        authorMasked: "마*현",
        rating: 5,
        content:
          "홈페이지 오픈 후 '검색해서 찾아왔다'는 손님이 확실히 늘었어요. 구조 설계 단계부터 SEO를 챙겨주신 덕분입니다.",
        date: "2026-07-23",
        serviceTitle: "반응형 홈페이지 제작 (기획~배포)",
      },
      {
        id: "p7-r2",
        authorMasked: "채*은",
        rating: 5,
        content: "정말 7일 만에 랜딩페이지가 나왔습니다. 수정 요청도 다음 날 바로 반영해주셨어요.",
        date: "2026-07-11",
        serviceTitle: "랜딩페이지 초고속 제작 (7일)",
      },
      {
        id: "p7-r3",
        authorMasked: "탁*민",
        rating: 4,
        content: "기획 미팅에서 우리 가게 이야기를 정말 오래 들어주셨어요. 결과물에 그게 다 담겼습니다.",
        date: "2026-06-27",
        serviceTitle: "반응형 홈페이지 제작 (기획~배포)",
      },
      {
        id: "p7-r4",
        authorMasked: "피*랑",
        rating: 4,
        content: "유지보수 기간에 문의했더니 당일에 처리해주셨습니다.",
        date: "2026-06-09",
      },
      {
        id: "p7-r5",
        authorMasked: "감*훈",
        rating: 4,
        content: "일정·산출물 정리가 깔끔해서 협업이 편했습니다.",
        date: "2026-05-25",
      },
    ],
  },
  {
    id: "p8",
    name: "그리드랩",
    tagline: "브랜드 톤을 통일한 쇼핑몰 구축",
    bio: [
      "그리드랩은 쇼핑몰 구축과 브랜드 디자인을 함께 다루는 디자인 랩입니다. 로고·상세페이지·쇼핑몰을 하나의 브랜드 톤으로 통일해, 따로 맡겼을 때 생기는 '조각난 브랜딩'을 없앱니다.",
      "구축 후에는 상세페이지 템플릿과 운영 가이드를 함께 드려, 내부 인력만으로도 신상품 등록이 가능하도록 돕습니다.",
    ],
    categories: ["web-design"],
    region: "서울 (온라인 협업 가능)",
    businessRegistrationMasked: "689-86-***34",
    verified: true,
    joinedAt: "2026-08-01",
    rating: 4.8,
    reviewCount: 36,
    responseRate: 96,
    careerYears: 5,
    completedCount: 150,
    avatarClass: "bg-gradient-to-br from-fuchsia-800 to-purple-700",
    portfolio: [
      {
        id: "p8-w1",
        title: "핸드메이드 브랜드 쇼핑몰 구축",
        summary: "로고 리뉴얼 + 상세페이지 20종",
        category: "web-design",
        themeClass: "bg-gradient-to-br from-fuchsia-900 to-purple-800",
      },
      {
        id: "p8-w2",
        title: "건강식품 브랜드 스토어",
        summary: "브랜드 톤 정립 후 몰 전체 적용",
        category: "web-design",
        themeClass: "bg-gradient-to-br from-purple-900 to-fuchsia-700",
      },
      {
        id: "p8-w3",
        title: "패션 편집숍 리브랜딩",
        summary: "기존 몰 유지하며 단계별 교체",
        category: "web-design",
        themeClass: "bg-gradient-to-br from-slate-700 to-purple-800",
      },
    ],
    reviews: [
      {
        id: "p8-r1",
        authorMasked: "성*주",
        rating: 5,
        content:
          "로고부터 쇼핑몰까지 톤이 통일되니 브랜드가 한 단계 올라간 느낌입니다. 운영 가이드도 큰 도움이 됐어요.",
        date: "2026-07-16",
        serviceTitle: "쇼핑몰 구축 + 브랜드 디자인",
      },
      {
        id: "p8-r2",
        authorMasked: "도*희",
        rating: 5,
        content: "상세페이지 템플릿 덕분에 신상품 등록을 직접 할 수 있게 됐습니다.",
        date: "2026-06-30",
        serviceTitle: "쇼핑몰 구축 + 브랜드 디자인",
      },
      {
        id: "p8-r3",
        authorMasked: "빈*아",
        rating: 5,
        content: "디자인 시안을 3개나 주셔서 고르는 재미가 있었어요. 소통도 빠릅니다.",
        date: "2026-06-12",
      },
      {
        id: "p8-r4",
        authorMasked: "온*결",
        rating: 4,
        content: "일정이 살짝 늘어졌지만 결과물 퀄리티로 만회하고도 남았습니다.",
        date: "2026-05-28",
      },
    ],
  },
];

export function getProviders(): Provider[] {
  return PROVIDERS;
}

export function getProvider(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

/** 가입일 최신순 상위 limit개 — 랜딩 "새로 합류한 업체" 롤링용. */
export function getNewProviders(limit: number): Provider[] {
  return [...PROVIDERS]
    .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt))
    .slice(0, limit);
}
