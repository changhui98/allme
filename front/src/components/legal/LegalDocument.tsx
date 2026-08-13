import type { LegalDoc } from "@/lib/legal/types";
import LegalDocBody from "./LegalDocBody";
import LegalToc from "./LegalToc";

/**
 * 약관·정책 문서 공용 레이아웃 (서버 컴포넌트).
 * 데스크톱(lg↑)은 좌측 고정(sticky) 목차 + 우측 본문의 2컬럼,
 * 모바일은 본문 상단에 목차 박스가 놓이는 사이드바 목차형 구조.
 * 이용약관(장→조)과 개인정보처리방침(조 단독) 두 형태를 모두 렌더링한다.
 * 본문 렌더링은 LegalDocBody(동의 스텝 펼쳐보기와 공용), 클라이언트 경계는 LegalToc 하나로 한정한다.
 * 스타일: styles/pages/legal.css (컨테이너는 공용 .page-container)
 */
export default function LegalDocument({ doc }: { doc: LegalDoc }) {
  const tocItems = doc.chapters.map(({ id, title }) => ({ id, title }));

  return (
    <main className="legal-doc page-container">
      <header className="legal-doc__header">
        <h1 className="legal-doc__title">{doc.title}</h1>
        <p className="legal-doc__date">시행일 {doc.effectiveDate}</p>
        {doc.preamble && (
          <p className="legal-doc__preamble">{doc.preamble}</p>
        )}
      </header>

      <div className="legal-doc__layout">
        {/* 모바일: 본문 위 박스 / 데스크톱: 왼쪽에 화면 고정 */}
        <aside className="legal-doc__aside">
          <LegalToc items={tocItems} />
        </aside>

        <LegalDocBody doc={doc} />
      </div>
    </main>
  );
}
