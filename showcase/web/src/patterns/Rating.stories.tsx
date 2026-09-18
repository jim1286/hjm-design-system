import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from "@hjmds/react/slider";
import { Statistic } from "@hjmds/react/display";
import { Button } from "@hjmds/react/actions";
import { Stack, Section } from "@hjmds/react/layout";
import { Notice } from "@hjmds/react/feedback";
export function RatingPreview({ step = 1 }: { step?: 1 | 0.5 }) {
  const [score, setScore] = useState(3); const [saved, setSaved] = useState<number | null>(null);
  return <Section title="오늘의 경험은 어땠나요?" description="1점부터 5점 사이에서 골라주세요."><Stack gap="md">
    <Slider label="내 점수" min={1} max={5} step={step} value={score} onValueChange={(value) => { setScore(value); setSaved(null); }} getValueText={(value) => `5점 만점에 ${value}점`} />
    <Statistic descriptor={{ id: "my-score", label: "선택한 점수", value: `${score} / 5` }} />
    <Button onClick={() => setSaved(score)}>점수 저장</Button>
    {saved !== null ? <Notice tone="success" title={`${saved}점으로 저장했어요`} /> : null}
  </Stack></Section>;
}
const meta = { title: "Patterns/Rating", component: RatingPreview } satisfies Meta<typeof RatingPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WholePoint: Story = {};
export const HalfPoint: Story = { args: { step: 0.5 } };
export const ReadOnlyAverage: Story = { render: () => <Statistic descriptor={{ id: "average-score", label: "평균 만족도", value: "4.3 / 5", hint: "예시 응답 120개" }} /> };
