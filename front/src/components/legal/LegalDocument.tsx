import type { LegalDoc } from "@/lib/legal/types";
import LegalDocBody from "./LegalDocBody";
import LegalToc from "./LegalToc";

/**
 * 약관·정책 문서 공용 레이아웃 (서버 컴포넌트).
 * 데스크톱(lg↑)은 좌측 고정(sticky) 목차 + 우측 본문의 2컬럼,
 * 모바일은 본문 상단에 목차 박스가 놓이는 사이드바 목차형 구조.
 * 이용약관(장→조)과 개인정보처리방침(조 단독) 두 형태를 모두 렌더링한다.
 * 본문 렌더링은 LegalDocBody(동의 스텝 펼쳐보기와 공용), 클라이언트 경계는 LegalToc 하나로 한정한다.
 */
export default function LegalDocument({ doc }: { doc: LegalDoc }) {
  const tocItems = doc.chapters.map(({ id, title }) => ({ id, title }));

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <header className="border-b border-stone-200 pb-6 dark:border-stone-800">
        <h1 className="text-2xl font-bold tracking-tight">{doc.title}</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          시행일 {doc.effectiveDate}
        </p>
        {doc.preamble && (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            {doc.preamble}
          </p>
        )}
      </header>

      <div className="mt-8 gap-12 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)]">
        {/* 모바일: 본문 위 박스 / 데스크톱: 왼쪽에 화면 고정 */}
        <aside className="mb-8 rounded-lg border border-stone-200 p-5 lg:sticky lg:top-24 lg:mb-0 lg:self-start lg:rounded-none lg:border-0 lg:p-0 dark:border-stone-800">
          <LegalToc items={tocItems} />
        </aside>

        <LegalDocBody doc={doc} />
      </div>
    </main>
  );
}
