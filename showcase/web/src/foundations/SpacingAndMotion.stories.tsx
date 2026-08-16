import type { Meta, StoryObj } from "@storybook/react-vite";

import { motionPreset, radius, spacing } from "@hjm/design-system";

function SpacingAndMotion() {
  return (
    <main className="hjm-page">
      <p className="hjm-eyebrow">Foundations</p>
      <h1 className="hjm-title">Spacing, shape and motion</h1>
      <p className="hjm-lead">
        Web은 px, Native는 dp로 번역하지만 같은 리듬과 전환 의도를 유지합니다.
      </p>
      <section className="hjm-section" aria-labelledby="spacing-title">
        <h2 className="hjm-section-title" id="spacing-title">Spacing</h2>
        <div className="hjm-card">
          {Object.entries(spacing).map(([name, value]) => (
            <div key={name} style={{ display: "grid", gridTemplateColumns: "56px 1fr 48px", gap: 12, alignItems: "center", marginBlock: 12 }}>
              <strong>{name}</strong>
              <div aria-hidden="true" style={{ width: value, height: 16, borderRadius: 4, background: "var(--hjm-primary)" }} />
              <span className="hjm-muted">{value}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="hjm-section" aria-labelledby="shape-title">
        <h2 className="hjm-section-title" id="shape-title">Radius</h2>
        <div className="hjm-grid">
          {Object.entries(radius).map(([name, value]) => (
            <article className="hjm-card" key={name}>
              <div aria-hidden="true" style={{ height: 96, borderRadius: value, background: "var(--hjm-surface-accent)" }} />
              <p><strong>{name}</strong> · {value}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="hjm-section" aria-labelledby="motion-title">
        <h2 className="hjm-section-title" id="motion-title">Motion presets</h2>
        <div className="hjm-grid">
          {Object.entries(motionPreset).map(([name, value]) => (
            <article className="hjm-card" key={name}>
              <span className="hjm-pill">{name}</span>
              <h3>{value.duration}ms</h3>
              <p className="hjm-muted">{value.easing} · reduced: {value.reducedMotion}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

const meta = {
  title: "Foundations/Spacing & Motion",
  component: SpacingAndMotion,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof SpacingAndMotion>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Foundations: Story = {};
