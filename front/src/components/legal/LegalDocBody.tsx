import type { LegalBlock, LegalDoc } from "@/lib/legal/types";

/**
 * 약관·정책 문서 본문(장/조/블록) 렌더러. (서버 호환 — 상태 없음)
 * - 기본: /terms·/privacy 전문 페이지 스타일 (LegalDocument에서 사용)
 * - compact: 회원가입 동의 스텝의 펼쳐보기처럼 좁은 박스용 — 제목 크기 축소
 */
export default function LegalDocBody({
  doc,
  compact = false,
}: {
  doc: LegalDoc;
  compact?: boolean;
}) {
  return (
    <div className="min-w-0">
      {doc.chapters.map((chapter, index) => (
        <section
          key={chapter.id}
          id={compact ? undefined : chapter.id}
          aria-labelledby={compact ? undefined : `${chapter.id}-heading`}
          // 헤더에 가리지 않도록 앵커 이동 여백 확보 (compact는 앵커 없음)
          className={`${compact ? "" : "scroll-mt-24"} ${
            index > 0 ? (compact ? "mt-6" : "mt-12") : ""
          }`}
        >
          <h2
            id={compact ? undefined : `${chapter.id}-heading`}
            className={
              compact
                ? "text-base font-bold tracking-tight"
                : "text-xl font-bold tracking-tight"
            }
          >
            {chapter.title}
          </h2>

          {chapter.blocks && <Blocks blocks={chapter.blocks} />}

          {chapter.articles?.map((article) => (
            <div key={article.title} className={compact ? "mt-4" : "mt-6"}>
              <h3
                className={`font-semibold text-stone-900 dark:text-stone-100 ${
                  compact ? "text-sm" : ""
                }`}
              >
                {article.title}
              </h3>
              <Blocks blocks={article.blocks} />
            </div>
          ))}
        </section>
      ))}
    </div>
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
