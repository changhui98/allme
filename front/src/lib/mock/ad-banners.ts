/**
 * 해드려요 페이지 광고 배너의 목업 데이터.
 * 광고 신청·집계 시스템은 백엔드와 함께 설계 예정 — API 연동 시
 * getAdBanners 내부만 fetch로 교체하면 컴포넌트는 그대로 유지된다.
 *
 * 이미지 스토리지가 아직 없어 배너는 그라데이션 배경 + 텍스트로 구성한다.
 */

export type AdBanner = {
  id: string;
  advertiserName: string;
  /** 배너 메인 문구 (예: "입주청소 20% 할인 이벤트") */
  headline: string;
  /** 한 줄 보조 문구 */
  subcopy: string;
  /** 클릭 시 이동 경로. 상세 페이지가 없으므로 카테고리 필터로 연결한다 */
  href: string;
  /** 배너별 배경 클래스. 텍스트는 흰색 고정이므로 어두운 톤 그라데이션만 사용할 것 */
  themeClass: string;
};

const AD_BANNERS: AdBanner[] = [
  {
    id: "ad1",
    advertiserName: "반짝홈클린",
    headline: "여름맞이 입주청소 20% 할인",
    subcopy: "8월 예약 한정 · 강남·서초 당일 견적",
    href: "/services?category=cleaning",
    themeClass: "bg-gradient-to-r from-sky-700 to-cyan-600",
  },
  {
    id: "ad2",
    advertiserName: "무드스튜디오",
    headline: "카페 창업 인테리어 무료 상담",
    subcopy: "3D 시안 제공 · 오픈 일정 맞춤 시공",
    href: "/services?category=interior",
    themeClass: "bg-gradient-to-r from-stone-700 to-amber-700",
  },
  {
    id: "ad3",
    advertiserName: "새벽페인팅",
    headline: "친환경 도장 시공 이벤트",
    subcopy: "가구 보양 무료 · 곰팡이 케어 포함",
    href: "/services?category=painting",
    themeClass: "bg-gradient-to-r from-emerald-800 to-teal-600",
  },
  {
    id: "ad4",
    advertiserName: "픽셀워크스",
    headline: "소상공인 홈페이지 첫 달 유지보수 무료",
    subcopy: "기획부터 배포까지 · 반응형 기본",
    href: "/services?category=web-design",
    themeClass: "bg-gradient-to-r from-indigo-800 to-violet-600",
  },
];

export function getAdBanners(): AdBanner[] {
  return AD_BANNERS;
}
