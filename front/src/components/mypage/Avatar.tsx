import { API_BASE_URL } from "@/lib/api";

/**
 * 프로필 아바타. 이미지가 있으면 원형으로 보여주고,
 * 없으면 이름 첫 글자를 넣은 이니셜 아바타로 폴백한다.
 * size 모디파이어: sm(상단 바) / md(모바일 메뉴 패널) / lg(내 정보 히어로).
 * 스타일: styles/pages/mypage.css
 */
export default function Avatar({
  name,
  imageUrl,
  size = "sm",
}: {
  name: string;
  imageUrl: string | null;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span className={`avatar avatar--${size}`} aria-hidden="true">
      {imageUrl ? (
        // 백엔드 정적 서빙 이미지라 next/image 최적화 대상이 아님 — 원본을 원형 크롭만 한다
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${API_BASE_URL}${imageUrl}`}
          alt=""
          className="avatar__image"
        />
      ) : (
        <span className="avatar__initial">{name.charAt(0)}</span>
      )}
    </span>
  );
}
