import type { Meta, StoryObj } from "@storybook/react-vite";

import { showcaseEnvironmentMatrix, showcaseScenarios } from "@hjmds/design-contracts/showcase";

function EnvironmentMatrix() {
  return (
    <main className="hjm-page">
      <p className="hjm-eyebrow">Patterns</p>
      <h1 className="hjm-title">Evidence matrix</h1>
      <p className="hjm-lead">
        위 toolbar를 바꾸면서 같은 story가 환경 변화에도 의미를 보존하는지 확인합니다.
      </p>
      <section className="hjm-section" aria-labelledby="matrix-title">
        <h2 className="hjm-section-title" id="matrix-title">Environment presets</h2>
        <div className="hjm-grid">
          {showcaseEnvironmentMatrix.map((environment) => (
            <article className="hjm-card" key={environment.id}>
              <span className="hjm-pill">{environment.id}</span>
              <h3>{environment.label}</h3>
              <p className="hjm-muted">Motion: {environment.motion}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="hjm-section" aria-labelledby="scenario-title">
        <h2 className="hjm-section-title" id="scenario-title">Story requirements</h2>
        <div className="hjm-grid">
          {showcaseScenarios.map((scenario) => (
            <article className="hjm-card" key={scenario.id}>
              <h3>{scenario.label}</h3>
              <p className="hjm-muted">{scenario.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

const meta = {
  title: "Patterns/Environment Matrix",
  component: EnvironmentMatrix,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof EnvironmentMatrix>;

export default meta;
type Story = StoryObj<typeof meta>;
export const RequiredEvidence: Story = {};
