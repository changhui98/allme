import type { LegalBlock, LegalDoc } from "@/lib/legal/types";

/**
 * 약관·정책 문서 본문(장/조/블록) 렌더러. (서버 호환 — 상태 없음)
 * - 기본: /terms·/privacy 전문 페이지 스타일 (LegalDocument에서 사용)
 * - compact: 회원가입 동의 스텝의 펼쳐보기처럼 좁은 박스용 — 제목 크기 축소
 * 스타일: styles/pages/legal.css (compact 분기는 legal-doc__body--compact 모디파이어)
 */
export default function LegalDocBody({
  doc,
  compact = false,
}: {
  doc: LegalDoc;
  compact?: boolean;
}) {
  return (
    <div
      className={`legal-doc__body${compact ? " legal-doc__body--compact" : ""}`}
    >
      {doc.chapters.map((chapter) => (
        <section
          key={chapter.id}
          id={compact ? undefined : chapter.id}
          aria-labelledby={compact ? undefined : `${chapter.id}-heading`}
          // 헤더에 가리지 않도록 앵커 이동 여백 확보 — compact 분기 포함 CSS가 처리
          className="legal-doc__section"
        >
          <h2
            id={compact ? undefined : `${chapter.id}-heading`}
            className="legal-doc__h2"
          >
            {chapter.title}
          </h2>

          {chapter.blocks && <Blocks blocks={chapter.blocks} />}

          {chapter.articles?.map((article) => (
            <div key={article.title} className="legal-doc__article">
              <h3 className="legal-doc__h3">{article.title}</h3>
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
            <p key={index} className="legal-doc__p">
              {block.text}
            </p>
          );
        }
        if (block.type === "list") {
          return (
            <ol key={index} className="legal-doc__list">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          );
        }
        return (
          <div key={index} className="legal-doc__table-wrap">
            <table className="legal-doc__table">
              <thead>
                <tr className="legal-doc__tr">
                  {block.headers.map((header) => (
                    <th key={header} scope="col" className="legal-doc__th">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="legal-doc__tr">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="legal-doc__td">
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
