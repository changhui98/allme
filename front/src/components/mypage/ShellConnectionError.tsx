"use client";

/**
 * 마이페이지·관리자 셸 공용 — /me 확인이 연결 실패·5xx로 끝났을 때의 화면.
 * 비로그인(401)과 달리 로그인 페이지로 보내지 않고 재시도만 제공한다(백엔드 재기동 중 오탐 방지).
 * 스타일: styles/pages/mypage.css (.mypage-shell__error)
 */
export default function ShellConnectionError({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div className="mypage-shell mypage-shell--pending">
      <div className="mypage-shell__error" role="alert">
        <p className="mypage-shell__error-message">
          서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.
        </p>
        <button
          type="button"
          className="btn btn--outline mypage-shell__retry"
          onClick={onRetry}
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
