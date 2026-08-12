import ScrollReveal from "@/components/motion/ScrollReveal";

const STEPS = [
  {
    title: "탐색·비교",
    description: "분야별 서비스를 둘러보고 가격·리뷰·포트폴리오를 비교하세요.",
  },
  {
    title: "예약 요청",
    description: "원하는 일정과 작업 내용을 담아 업체에 예약을 요청하세요.",
  },
  {
    title: "안전결제",
    description: "결제금은 올미가 보관해요. 업체에 바로 지급되지 않아 안심.",
  },
  {
    title: "완료 확인 후 정산",
    description: "작업 완료를 직접 확인한 뒤에야 업체에 정산됩니다.",
  },
];

/**
 * 거래 사이클 4단계 소개 (서버 컴포넌트).
 * 에스크로(완료 확인 후 지급)가 핵심 차별점이라 3·4단계에 명시한다.
 * 스타일: styles/pages/home.css
 */
export default function HowItWorksSection() {
  return (
    <section aria-labelledby="how-it-works-heading" className="how-it-works">
      <ScrollReveal>
        <h2 id="how-it-works-heading" className="how-it-works__heading">
          이렇게 진행돼요
        </h2>
        <p className="how-it-works__subtitle">
          예약부터 정산까지, 거래의 모든 단계를 올미가 함께합니다.
        </p>
      </ScrollReveal>

      <ol className="how-it-works__steps">
        {STEPS.map((step, index) => (
          <li key={step.title}>
            <ScrollReveal delay={index * 80} className="how-it-works__reveal">
              <div className="card how-it-works__card">
                <span className="how-it-works__step-num">{index + 1}</span>
                <h3 className="how-it-works__step-title">{step.title}</h3>
                <p className="how-it-works__step-desc">{step.description}</p>
              </div>
            </ScrollReveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
