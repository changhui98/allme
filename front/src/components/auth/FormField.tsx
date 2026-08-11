/**
 * 로그인·회원가입 폼의 밑줄형 플로팅 라벨 인풋. (서버 컴포넌트)
 * 네이버 로그인처럼 포커스하거나 값이 있으면 라벨이 위로 떠오르고,
 * 포커스 시 포인트색 밑줄이 중앙에서 퍼진다. JS 없이 CSS(peer)만으로 동작:
 * - 라벨 부상 판정은 :focus + :not(:placeholder-shown) — 이를 위해 placeholder는 공백 한 칸
 * - 포인트 밑줄(2px)은 기본 보더(1px) 위에 겹치는 절대 배치라 레이아웃 밀림이 없다
 */
type FormFieldProps = {
  /** input의 id이자 name — 라벨 연결(htmlFor)에 그대로 쓰인다 */
  id: string;
  label: string;
  type: "text" | "email" | "password";
  /** 브라우저 자동완성 힌트 (예: email, current-password, new-password) */
  autoComplete: string;
  /** 초기값 (비제어 유지 — 값이 있으면 :not(:placeholder-shown)으로 라벨이 떠 있는 상태가 된다) */
  defaultValue?: string;
  /** 본인인증 결과 프리필처럼 수정 불가로 보여줄 때 */
  readOnly?: boolean;
};

export default function FormField({
  id,
  label,
  type,
  autoComplete,
  defaultValue,
  readOnly,
}: FormFieldProps) {
  return (
    <div className="relative pt-5">
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        readOnly={readOnly}
        placeholder=" "
        className="peer w-full border-b border-stone-300 bg-transparent py-2 text-[15px] outline-none read-only:text-stone-500 dark:border-stone-700 dark:read-only:text-stone-400"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-[27px] text-[15px] text-stone-400 transition-all duration-150 peer-focus:top-0 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs dark:text-stone-500"
      >
        {label}
      </label>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-0.5 origin-center scale-x-0 bg-primary transition-transform duration-200 peer-focus:scale-x-100"
      />
    </div>
  );
}
