import Link from "next/link";
import { FOOTER_GROUPS } from "./nav-items";

/**
 * 모든 페이지 공통 푸터 (서버 컴포넌트). 스타일: styles/components/footer.css
 * 상단: 링크 그룹(카테고리/올미/고객지원/약관) — 하단: 사업자 정보 + 카피라이트.
 * body가 flex-col, main이 flex-1이므로 별도 mt-auto 없이 화면 바닥에 붙는다.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* 링크 그룹 */}
        <div className="footer__groups">
          {FOOTER_GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="footer__group-title">{group.title}</h2>
              <ul className="footer__links">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* 사업자 정보 + 카피라이트 */}
        <div className="footer__bottom">
          <p className="footer__brand">올미 (allme)</p>
          <p className="footer__info">
            통합 서비스 마켓플레이스
            <br />
            {/* 사업자 정보는 추후 실제 값으로 교체 */}
            상호명 (주)올미 · 대표 OOO · 사업자등록번호 000-00-00000
            <br />
            주소 서울특별시 · 고객센터 0000-0000
          </p>
          <p className="footer__copyright">
            © {year} allme. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
