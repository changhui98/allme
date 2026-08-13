import type { SignupStep } from "@/components/auth/SignupFlow";

const STEPS: { key: SignupStep; label: string }[] = [
  { key: "consent", label: "약관동의" },
  { key: "verify", label: "본인인증" },
  { key: "form", label: "정보입력" },
];

/**
 * 회원가입 진행 스테퍼: ①약관동의 ─ ②본인인증 ─ ③정보입력.
 * SignupFlow의 step 문자열을 그대로 받아 앞 단계=완료(✓)/현재/대기를 그린다.
 * props만 받는 순수 렌더라 "use client" 없이 클라이언트 트리 안에서 쓴다.
 * 스타일: styles/pages/auth.css
 */
export default function SignupStepper({ current }: { current: SignupStep }) {
  const currentIndex = STEPS.findIndex((step) => step.key === current);

  return (
    <nav aria-label="회원가입 진행 단계">
      <ol className="signup-stepper">
        {STEPS.map((step, index) => {
          const state =
            index < currentIndex
              ? "done"
              : index === currentIndex
                ? "current"
                : "todo";

          return (
            <li
              key={step.key}
              aria-current={state === "current" ? "step" : undefined}
              className="signup-stepper__step"
            >
              <span
                className={`signup-stepper__dot signup-stepper__dot--${state}`}
              >
                {state === "done" ? (
                  <>
                    <CheckIcon />
                    <span className="sr-only">완료됨</span>
                  </>
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`signup-stepper__label signup-stepper__label--${state}`}
              >
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`signup-stepper__line${
                    index < currentIndex ? " signup-stepper__line--done" : ""
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="signup-stepper__check"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}
