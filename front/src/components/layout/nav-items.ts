/**
 * 헤더·푸터·모바일 네비가 공유하는 링크 데이터의 단일 출처(single source of truth).
 * 링크를 추가·수정할 때는 이 파일만 고치면 모든 공통 컴포넌트에 반영된다.
 *
 * 게시판 2개(/services, /requests) 외의 href는 아직 계획된 경로를 가리키는 플레이스홀더다.
 * 카테고리는 네비 링크가 아니라 목록 필터로 쓰이므로 @/lib/categories에 있다.
 */

export type NavLink = {
  label: string;
  href: string;
};

export type FooterLinkGroup = {
  title: string;
  links: NavLink[];
};

/**
 * 헤더 주요 메뉴 — 거래의 양방향 게시판.
 * 해드려요: 업체가 등록한 서비스 목록 / 해주세요: 사용자가 올린 요청 목록
 */
export const BOARD_LINKS: NavLink[] = [
  { label: "해드려요", href: "/services" },
  { label: "해주세요", href: "/requests" },
];

/** 헤더 우측 인증 관련 링크 */
export const AUTH_LINKS = {
  login: { label: "로그인", href: "/login" },
  signup: { label: "회원가입", href: "/signup" },
} as const;

/** 푸터 링크 그룹 */
export const FOOTER_GROUPS: FooterLinkGroup[] = [
  {
    title: "둘러보기",
    links: BOARD_LINKS,
  },
  {
    title: "올미",
    links: [
      { label: "회사 소개", href: "/about" },
      { label: "업체 등록", href: "/business/register" },
      { label: "공지사항", href: "/notice" },
    ],
  },
  {
    title: "고객지원",
    links: [
      { label: "고객센터", href: "/support" },
      { label: "자주 묻는 질문", href: "/support/faq" },
      { label: "1:1 문의", href: "/support/inquiry" },
    ],
  },
  {
    title: "약관·정책",
    links: [
      { label: "이용약관", href: "/terms" },
      { label: "개인정보처리방침", href: "/privacy" },
    ],
  },
];
