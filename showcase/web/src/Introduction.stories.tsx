import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  showcaseEnvironmentMatrix,
  showcaseManifest,
  summarizeShowcaseMaturity,
} from "@hjm/design-system/showcase";

function Introduction() {
  const maturity = summarizeShowcaseMaturity();

  return (
    <main className="hjm-page">
      <p className="hjm-eyebrow">HJM Design System · v0.2 candidate</p>
      <h1 className="hjm-title">조용한 화면 위에 중요한 순간만 선명하게.</h1>
      <p className="hjm-lead">
        HJM Showcase는 시각 샘플과 동작·접근성 계약을 함께 실행하는 문서입니다. Web과
        Native는 같은 의미와 상태를 공유하고 각 플랫폼에 맞는 renderer를 사용합니다.
      </p>

      <section className="hjm-section" aria-labelledby="coverage-title">
        <h2 className="hjm-section-title" id="coverage-title">Catalog coverage</h2>
        <div className="hjm-grid">
          <article className="hjm-card">
            <span className="hjm-pill" data-status="stable">Stable</span>
            <h3>{maturity.stable} components</h3>
            <p className="hjm-muted">제품에서 반복 사용되고 계약이 고정된 구성요소</p>
          </article>
          <article className="hjm-card">
            <span className="hjm-pill" data-status="beta">Beta</span>
            <h3>{maturity.beta} components</h3>
            <p className="hjm-muted">실제 앱 적용 증거를 축적하고 있는 구성요소</p>
          </article>
          <article className="hjm-card">
            <span className="hjm-pill" data-status="planned">Planned</span>
            <h3>{maturity.planned} components</h3>
            <p className="hjm-muted">범위와 책임만 예약된 다음 확장 후보</p>
          </article>
          <article className="hjm-card">
            <span className="hjm-pill">Total</span>
            <h3>{showcaseManifest.length} catalog entries</h3>
            <p className="hjm-muted">공통 catalog에서 자동으로 생성된 현재 범위</p>
          </article>
        </div>
      </section>

      <section className="hjm-section" aria-labelledby="environment-title">
        <h2 className="hjm-section-title" id="environment-title">Required environments</h2>
        <div className="hjm-grid">
          {showcaseEnvironmentMatrix.map((environment) => (
            <article className="hjm-card" key={environment.id}>
              <h3>{environment.label}</h3>
              <p className="hjm-muted">
                theme {environment.theme} · dir {environment.direction} · text {environment.textScale * 100}%
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

const meta = {
  title: "Introduction/Overview",
  component: Introduction,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Introduction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
