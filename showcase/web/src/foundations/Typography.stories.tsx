import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { typography } from "@hjm/design-contracts";

type TypographySampleStyle = CSSProperties &
  Record<"--hjm-sample-font-size" | "--hjm-sample-font-weight" | "--hjm-sample-line-height", string>;

function kebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function Typography() {
  return (
    <main className="hjm-page">
      <p className="hjm-eyebrow">Foundations</p>
      <h1 className="hjm-title">Typography</h1>
      <p className="hjm-lead">
        역할 기반 타입 스케일입니다. toolbar에서 200%를 선택해 줄바꿈과 정보 보존을 확인하세요.
      </p>
      <section className="hjm-section" aria-label="Typography scale">
        <div className="hjm-grid">
          {Object.entries(typography).map(([name, value]) => {
            const tokenName = kebabCase(name);
            const style = {
              "--hjm-sample-font-size": `var(--hjm-type-${tokenName}-size)`,
              "--hjm-sample-font-weight": `var(--hjm-type-${tokenName}-weight)`,
              "--hjm-sample-line-height": `var(--hjm-type-${tokenName}-line-height)`,
            } as TypographySampleStyle;
            return (
              <article className="hjm-card" key={name}>
                <span className="hjm-pill">{name}</span>
                <p className="hjm-type-role-sample" style={style}>중요한 순간을 분명하게 보여줘요.</p>
                <p className="hjm-muted">
                  {value.fontSize}/{value.lineHeight} · weight {value.fontWeight}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

const meta = {
  title: "Foundations/Typography",
  component: Typography,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Roles: Story = {};
