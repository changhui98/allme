/**
 * 헤더·푸터·모바일 네비가 공유하는 링크 데이터의 단일 출처(single source of truth).
 * 카테고리/링크를 추가·수정할 때는 이 파일만 고치면 모든 공통 컴포넌트에 반영된다.
 *
 * 라우팅 페이지는 아직 없으므로 href는 계획된 경로를 가리키는 플레이스홀더다.
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
 * 오픈 시 카테고리 4개 (CLAUDE.md "초기 범위는 좁게" 원칙).
 * 청소 / 인테리어 / 페인트·도장 / 웹·디자인 제작
 */
export const CATEGORIES: NavLink[] = [
  { label: "청소", href: "/category/cleaning" },
  { label: "인테리어", href: "/category/interior" },
  { label: "페인트·도장", href: "/category/painting" },
  { label: "웹·디자인 제작", href: "/category/web-design" },
];

/** 헤더 우측 인증 관련 링크 */
export const AUTH_LINKS = {
  login: { label: "로그인", href: "/login" },
  signup: { label: "회원가입", href: "/signup" },
} as const;

/** 푸터 링크 그룹 */
export const FOOTER_GROUPS: FooterLinkGroup[] = [
  {
    title: "카테고리",
    links: CATEGORIES,
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
