import FormField from "@/components/auth/FormField";

/**
 * 회원가입 정보 입력 폼 (약관 동의·본인인증 완료 후 스텝 3).
 * 이름은 본인인증 결과로 프리필하고 수정 불가 — 인증된 실명을 그대로 쓴다.
 * 약관 동의는 스텝 1에서 이미 받았고, 마케팅 수신 여부만 hidden으로 실어 보낸다.
 * 가입 제출은 백엔드 user 도메인 구현 후 붙인다.
 */
export default function SignupForm({
  name,
  marketingConsent,
}: {
  name: string;
  marketingConsent: boolean;
}) {
  return (
    <form className="flex flex-col gap-2">
      <input
        type="hidden"
        name="marketing-consent"
        value={String(marketingConsent)}
      />
      <FormField
        id="name"
        label="이름"
        type="text"
        autoComplete="name"
        defaultValue={name}
        readOnly
      />
      <FormField id="email" label="이메일" type="email" autoComplete="email" />
      <FormField
        id="password"
        label="비밀번호 (8자 이상)"
        type="password"
        autoComplete="new-password"
      />
      <FormField
        id="password-confirm"
        label="비밀번호 확인"
        type="password"
        autoComplete="new-password"
      />

      <button
        type="submit"
        className="mt-6 w-full rounded-lg bg-primary py-3 text-[15px] font-semibold text-primary-foreground hover:bg-primary-hover"
      >
        가입하기
      </button>
    </form>
  );
}
