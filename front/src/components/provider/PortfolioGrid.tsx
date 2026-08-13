import { getCategoryLabel } from "@/lib/categories";
import type { PortfolioItem } from "@/lib/mock/providers";

/**
 * 업체 상세의 포트폴리오 그리드 (서버 컴포넌트).
 * 이미지 스토리지가 아직 없어 그라데이션 타일로 대체한다 —
 * 스토리지 연동 시 타일 배경을 next/image(fill)로 교체하면 된다.
 * 스타일: styles/pages/provider.css
 */
export default function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  return (
    <ul className="portfolio-grid">
      {items.map((item) => (
        <li
          key={item.id}
          className={`portfolio-grid__item ${item.themeClass}`}
        >
          <div className="portfolio-grid__overlay">
            <p className="portfolio-grid__category">
              {getCategoryLabel(item.category)}
            </p>
            <p className="portfolio-grid__title">{item.title}</p>
            <p className="portfolio-grid__summary">{item.summary}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
