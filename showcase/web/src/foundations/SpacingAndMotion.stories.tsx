import type { Meta, StoryObj } from "@storybook/react-vite";

import type { CSSProperties } from "react";

import { motionPreset, radius, spacing } from "@hjmds/design-contracts";

type TokenSampleStyle = CSSProperties & Record<`--hjm-sample-${string}`, string>;

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
            <div className="hjm-token-row" key={name}>
              <strong>{name}</strong>
              <div
                aria-hidden="true"
                className="hjm-spacing-sample"
                style={{ "--hjm-sample-width": `var(--hjm-space-${name})` } as TokenSampleStyle}
              />
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
              <div
                aria-hidden="true"
                className="hjm-radius-sample"
                style={{ "--hjm-sample-radius": `var(--hjm-radius-${name})` } as TokenSampleStyle}
              />
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
              <div
                aria-label={`${name} motion sample`}
                className="hjm-motion-sample"
                data-reduced-strategy={value.reducedMotion}
                style={{
                  "--hjm-sample-motion-duration": `var(--hjm-motion-preset-${name}-effective-duration)`,
                  "--hjm-sample-motion-easing": `var(--hjm-motion-preset-${name}-easing)`,
                } as TokenSampleStyle}
              >
                <span aria-hidden="true" />
              </div>
            </article>
          ))}
          <article className="hjm-card">
            <span className="hjm-pill">continuous</span>
            <h3>Static fallback</h3>
            <p className="hjm-muted">Continuous indicators pause at Reduce Motion.</p>
            <div className="hjm-motion-sample" data-reduced-strategy="static">
              <span aria-hidden="true" />
            </div>
          </article>
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
