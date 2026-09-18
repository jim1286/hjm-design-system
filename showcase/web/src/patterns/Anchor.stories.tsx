import { useId, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Anchor } from "@hjmds/react/anchor";
import { Section, Stack } from "@hjmds/react/layout";

const sections = [
  { key: "start", title: "작게 시작해요", paragraphs: ["오늘 기억하고 싶은 순간 하나를 골라보세요. 긴 글을 쓸 필요는 없어요.", "눈에 들어온 풍경이나 들었던 말처럼 작은 장면이면 충분해요.", "기록을 남길 시간을 정해두면 하루를 돌아보기가 조금 더 쉬워져요."] },
  { key: "keep", title: "나에게 맞게 모아요", paragraphs: ["함께 보고 싶은 기록에 같은 주제를 붙여보세요. 산책, 여행, 식사처럼 편한 이름을 쓰면 돼요.", "제목을 바꿔도 기록의 내용은 그대로 남아요. 나중에 찾기 좋은 이름으로 다듬어보세요.", "분류가 떠오르지 않으면 먼저 기록만 남겨도 괜찮아요."] },
  { key: "review", title: "다시 돌아봐요", paragraphs: ["한 주가 끝나면 가장 마음에 남는 기록을 골라보세요.", "처음에는 지나쳤던 기쁨을 다시 발견할 수도 있어요."] },
];
export function AnchorPreview({ horizontal = true }: { horizontal?: boolean }) {
  const id = useId(); const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const items = sections.map((section) => ({ id: `${id}-${section.key}`, label: section.title }));
  return <Section title="기록을 오래 이어가는 방법" description="궁금한 부분부터 읽어보세요."><Stack gap="md">
    <Anchor label="기록 가이드 목차" items={items} container={container} orientation={horizontal ? "horizontal" : "vertical"} historyMode="none" />
    {/* A bounded document makes scroll tracking observable inside a component canvas. */}
    <div ref={setContainer} className="hjm-showcase-anchor-document" tabIndex={0} role="region" aria-label="기록 가이드 본문">
      {sections.map((section, index) => <section key={section.key} id={items[index]!.id} className="hjm-showcase-anchor-section">
        <h3>{section.title}</h3>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </section>)}
    </div>
  </Stack></Section>;
}
const meta = { title: "Patterns/Anchor", component: AnchorPreview } satisfies Meta<typeof AnchorPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guide: Story = {};
export const Vertical: Story = { args: { horizontal: false } };
export const LargeText: Story = { globals: { textScale: "2" } };
