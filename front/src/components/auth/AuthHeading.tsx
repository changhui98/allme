/**
 * 인증 페이지 제목 + 안내 문구. ("use client" 없는 순수 프레젠테이션)
 * 로그인은 AuthShell이, 회원가입은 SignupFlow가 스텝별로 갈아끼우며 쓴다.
 */
export default function AuthHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <h1 className="text-center text-xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1 text-center text-sm text-muted">{description}</p>
    </>
  );
}
