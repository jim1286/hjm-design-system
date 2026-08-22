import type { Meta, StoryObj } from "@storybook/react-vite";

import { ACCENTS, THEMES, accentFill, brandGradient } from "@hjm/design-contracts";

function Swatch({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <article className="hjm-card">
      <div
        aria-hidden="true"
        className="hjm-color-swatch"
        style={{
          background: color,
        }}
      />
      <strong>{label}</strong>
      <p className="hjm-muted">{value}</p>
    </article>
  );
}

function Colors() {
  return (
    <main className="hjm-page">
      <p className="hjm-eyebrow">Foundations</p>
      <h1 className="hjm-title">Semantic color</h1>
      <p className="hjm-lead">
        제품은 palette 이름 대신 의미를 선택합니다. 두 테마는 정확히 같은 키를 제공합니다.
      </p>
      {Object.entries(THEMES).map(([theme, colors]) => (
        <section className="hjm-section" key={theme} aria-labelledby={`${theme}-title`}>
          <h2 className="hjm-section-title" id={`${theme}-title`}>{theme}</h2>
          <div className="hjm-grid">
            {Object.entries(colors).map(([name, value]) => (
              <Swatch color={value} key={name} label={name} value={value} />
            ))}
          </div>
        </section>
      ))}
      <section className="hjm-section" aria-labelledby="accent-title">
        <h2 className="hjm-section-title" id="accent-title">Status accents</h2>
        <div className="hjm-grid">
          {Object.entries(ACCENTS.light).map(([name, value]) => (
            <Swatch color={value} key={name} label={name} value={`${value} · fill ${accentFill[name as keyof typeof accentFill]}`} />
          ))}
          <Swatch
            color={`linear-gradient(135deg, ${brandGradient.from}, ${brandGradient.to})`}
            label="brandGradient"
            value={`${brandGradient.from} → ${brandGradient.to}`}
          />
        </div>
      </section>
    </main>
  );
}

const meta = {
  title: "Foundations/Colors",
  component: Colors,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Colors>;

export default meta;
type Story = StoryObj<typeof meta>;
export const SemanticPalette: Story = {};
