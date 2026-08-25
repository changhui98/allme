"use client";

import { useState } from "react";
import { useMe } from "@/lib/use-me";
import { updateMarketingConsent } from "@/lib/user";

/**
 * 알림 설정 섹션 — 마케팅 수신 동의 스위치 토글, 낙관적 갱신 + 실패 시 원복.
 * useMe 캐시는 건드리지 않고 로컬 state로만 관리한다(다른 화면에 노출되지 않는 값).
 * 스타일: styles/pages/mypage.css(mypage-group·mypage-consent) + components/switch.css
 */
export default function MarketingConsentSection() {
  const { me } = useMe();
  const [consent, setConsent] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!me) return null;
  const checked = consent ?? me.marketingConsent;

  const handleToggle = async () => {
    if (pending) return;
    const next = !checked;
    setConsent(next); // 낙관적 갱신
    setPending(true);
    setError(null);
    try {
      const updated = await updateMarketingConsent(next);
      setConsent(updated.marketingConsent);
    } catch (e) {
      setConsent(!next); // 실패 원복
      setError(
        e instanceof Error ? e.message : "수신 동의 변경에 실패했습니다.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="mypage-group" aria-labelledby="notification-title">
      <div className="mypage-group__header">
        <h2 id="notification-title" className="mypage-group__title">
          알림 설정
        </h2>
      </div>
      <div className="mypage-rows">
        <div className="mypage-row mypage-consent">
          <div className="mypage-consent__body">
            <p className="mypage-consent__label" id="marketing-consent-label">
              마케팅 정보 수신 동의
            </p>
            <p className="mypage-consent__sub">
              이벤트·혜택 소식을 이메일과 알림으로 받아요.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-labelledby="marketing-consent-label"
            onClick={() => void handleToggle()}
            disabled={pending}
            className={`switch${checked ? " is-on" : ""}`}
          >
            <span className="switch__thumb" />
          </button>
        </div>
      </div>
      {error ? (
        <p className="mypage-group__error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
