import type { LegalBlock, LegalDoc } from "@/lib/legal/types";
import LegalToc from "./LegalToc";

/**
 * 약관·정책 문서 공용 레이아웃 (서버 컴포넌트).
 * 데스크톱(lg↑)은 좌측 고정(sticky) 목차 + 우측 본문의 2컬럼,
 * 모바일은 본문 상단에 목차 박스가 놓이는 사이드바 목차형 구조.
 * 이용약관(장→조)과 개인정보처리방침(조 단독) 두 형태를 모두 렌더링한다.
 * 클라이언트 경계는 LegalToc 하나로 한정한다.
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

        <div className="min-w-0">
          {doc.chapters.map((chapter, index) => (
            <section
              key={chapter.id}
              id={chapter.id}
              aria-labelledby={`${chapter.id}-heading`}
              // 헤더에 가리지 않도록 앵커 이동 여백 확보
              className={`scroll-mt-24 ${index > 0 ? "mt-12" : ""}`}
            >
              <h2
                id={`${chapter.id}-heading`}
                className="text-xl font-bold tracking-tight"
              >
                {chapter.title}
              </h2>

              {chapter.blocks && <Blocks blocks={chapter.blocks} />}

              {chapter.articles?.map((article) => (
                <div key={article.title} className="mt-6">
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                    {article.title}
                  </h3>
                  <Blocks blocks={article.blocks} />
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

/** 문단·목록·표 블록을 순서대로 렌더링한다. */
function Blocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "p") {
          return (
            <p
              key={index}
              className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400"
            >
              {block.text}
            </p>
          );
        }
        if (block.type === "list") {
          return (
            <ol
              key={index}
              className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-stone-600 dark:text-stone-400"
            >
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          );
        }
        return (
          <div key={index} className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800">
                  {block.headers.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="py-2 pr-4 text-left font-semibold text-stone-900 dark:text-stone-100"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-stone-200 dark:border-stone-800"
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="py-2 pr-4 align-top leading-relaxed text-stone-600 dark:text-stone-400"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </>
  );
}
