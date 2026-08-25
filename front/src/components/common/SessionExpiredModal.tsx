"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/common/Modal";
import { subscribeSessionExpired } from "@/lib/api";
import { currentPath, loginHref } from "@/lib/login-redirect";

/**
 * 전역 세션 만료 안내 — lib/api의 request()가 401 U011을 감지하면 신호를 받아 뜬다.
 * 모든 탈출 경로가 풀 내비게이션(useMe 모듈 캐시 초기화 목적):
 * 다시 로그인 → /login?redirect=<현재 경로> (로그인 후 보던 페이지로 복귀), 홈으로·ESC → /.
 * 백드롭 클릭으로는 닫히지 않는다 — 반로그인 상태로 화면에 남는 것을 막기 위함.
 */
export default function SessionExpiredModal() {
  const [expired, setExpired] = useState(false);

  useEffect(() => subscribeSessionExpired(() => setExpired(true)), []);

  return (
    <Modal
      open={expired}
      title="로그인이 만료되었습니다"
      closeOnBackdrop={false}
      onClose={() => window.location.assign("/")}
      actions={
        <>
          <button
            type="button"
            className="btn btn--outline modal__btn"
            onClick={() => window.location.assign("/")}
          >
            홈으로
          </button>
          <button
            type="button"
            className="btn btn--primary modal__btn"
            onClick={() => window.location.assign(loginHref(currentPath()))}
          >
            다시 로그인
          </button>
        </>
      }
    >
      <p>
        세션이 만료되어 로그아웃되었습니다.
        <br />
        계속하려면 다시 로그인해 주세요.
      </p>
    </Modal>
  );
}
