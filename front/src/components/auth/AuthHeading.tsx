/**
 * 인증 페이지 제목 + 안내 문구. ("use client" 없는 순수 프레젠테이션)
 * 로그인은 AuthShell이, 회원가입은 SignupFlow가 스텝별로 갈아끼우며 쓴다.
 * 스타일: styles/pages/auth.css
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
      <h1 className="auth-heading">{title}</h1>
      <p className="auth-heading__desc">{description}</p>
    </>
  );
}
