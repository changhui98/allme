/**
 * 약관·정책 문서의 데이터 타입.
 * 법률 문서를 "장(章) → 조(條) → 본문 블록" 구조로 표현한다.
 * - 이용약관: 장 아래에 조가 나열되는 2단 구조
 * - 개인정보처리방침: 조가 곧 최상위 항목이므로 장에 blocks를 직접 담는 1단 구조
 * 두 형태를 모두 소화하도록 chapter는 articles와 blocks를 선택적으로 가진다.
 */

/** 문서 본문을 구성하는 최소 단위. 문단 / 번호 목록 / 표 세 가지로 충분하다. */
export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

/** 조(條) — "제1조 (목적)" 단위 */
export type LegalArticle = {
  title: string;
  blocks: LegalBlock[];
};

/** 장(章) — 사이드바 목차의 한 항목. 앵커 이동을 위해 id를 가진다. */
export type LegalChapter = {
  id: string;
  title: string;
  /** 장 바로 아래 붙는 본문 (개인정보처리방침처럼 조 없이 쓰는 경우) */
  blocks?: LegalBlock[];
  /** 장에 속한 조 목록 (이용약관) */
  articles?: LegalArticle[];
};

/** 문서 전체 — LegalDocument 컴포넌트에 그대로 주입한다. */
export type LegalDoc = {
  title: string;
  /** 문서 머리말 (전문·안내 문구) */
  preamble?: string;
  /** 표기용 시행일 문자열 (예: "2026. 8. 8.") */
  effectiveDate: string;
  chapters: LegalChapter[];
};
