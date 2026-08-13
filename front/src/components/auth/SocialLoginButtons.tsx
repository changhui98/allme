/**
 * "또는" 구분선 + 소셜 로그인 버튼 3종(카카오·구글·애플). (서버 컴포넌트)
 * 버튼 문구·색상은 각 플랫폼 브랜드 가이드라인의 허용 범위만 사용한다:
 * - 카카오: 말풍선 심볼 + 「카카오 로그인」 문구 고정, 배경 #FEE500은 다크 모드에서도 유지
 * - Google: 4색 G 로고 + 「Google로 로그인/계속하기」
 * - Apple: Apple 로고(currentColor로 테마 반전) + 「Apple로 로그인/가입하기」
 * 아직 UI 레이아웃 단계라 클릭 동작은 없다 — OAuth 연동 시 핸들러를 붙인다.
 * 스타일: styles/pages/auth.css
 */
type SocialLoginButtonsProps = {
  /** 페이지 성격에 따라 브랜드 가이드가 허용하는 문구로 분기한다 */
  variant: "login" | "signup";
};

const LABELS = {
  login: {
    kakao: "카카오 로그인",
    google: "Google로 로그인",
    apple: "Apple로 로그인",
  },
  signup: {
    kakao: "카카오 로그인",
    google: "Google로 계속하기",
    apple: "Apple로 가입하기",
  },
} as const;

export default function SocialLoginButtons({ variant }: SocialLoginButtonsProps) {
  const labels = LABELS[variant];

  return (
    <div className="social-login">
      <div aria-hidden="true" className="social-login__divider">
        <span className="social-login__divider-line" />
        또는
        <span className="social-login__divider-line" />
      </div>

      <div className="social-login__buttons">
        <button
          type="button"
          className="social-login__btn social-login__btn--kakao"
        >
          <KakaoIcon />
          {labels.kakao}
        </button>
        <button
          type="button"
          className="social-login__btn social-login__btn--google"
        >
          <GoogleIcon />
          {labels.google}
        </button>
        <button
          type="button"
          className="social-login__btn social-login__btn--apple"
        >
          <AppleIcon />
          {labels.apple}
        </button>
      </div>
    </div>
  );
}

/** 카카오 말풍선 심볼 — 브랜드 가이드에 따라 검정 고정 */
function KakaoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="social-login__icon"
      aria-hidden="true"
    >
      <path
        fill="#000000"
        d="M12 3C6.477 3 2 6.463 2 10.735c0 2.77 1.874 5.2 4.69 6.567-.152.53-.978 3.397-1.011 3.623 0 0-.02.168.089.232a.297.297 0 0 0 .239.015c.316-.044 3.657-2.393 4.235-2.802.577.08 1.166.121 1.758.121 5.523 0 10-3.463 10-7.756C22 6.463 17.523 3 12 3"
      />
    </svg>
  );
}

/** 구글 4색 G 로고 — 양 테마에서 색상 동일 */
function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="social-login__icon"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

/** 애플 로고 — currentColor라서 버튼 텍스트 색을 따라 테마 반전된다 */
function AppleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="social-login__icon"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      />
    </svg>
  );
}
