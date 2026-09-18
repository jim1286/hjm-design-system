import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { Slider } from "@hjmds/react-native/slider";
import { Statistic } from "@hjmds/react-native/data-display";
import { Button } from "@hjmds/react-native/actions";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { Notice } from "@hjmds/react-native/feedback";
function RatingPreview({ step = 1 }: { step?: 1 | 0.5 }) {
  const [score, setScore] = useState(3); const [saved, setSaved] = useState<number | null>(null);
  return <Stack gap="md"><Text variant="title" emphasis="strong">오늘의 경험은 어땠나요?</Text><Text tone="muted">1점부터 5점 사이에서 골라주세요.</Text>
    <Slider label="내 점수" min={1} max={5} step={step} value={score} onValueChange={(value) => { setScore(value); setSaved(null); }} getValueText={(value) => `5점 만점에 ${value}점`} incrementLabel="점수 올리기" decrementLabel="점수 내리기" />
    <Statistic descriptor={{ id: "my-score", label: "선택한 점수", value: `${score} / 5` }} />
    <Button onPress={() => setSaved(score)}>점수 저장</Button>
    {saved !== null ? <Notice tone="success" title={`${saved}점으로 저장했어요`} /> : null}
  </Stack>;
}
const meta = { title: "Patterns/Rating", component: RatingPreview } satisfies Meta<typeof RatingPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WholePoint: Story = {};
export const HalfPoint: Story = { args: { step: 0.5 } };
export const ReadOnlyAverage: Story = { render: () => <Statistic descriptor={{ id: "average-score", label: "평균 만족도", value: "4.3 / 5", hint: "예시 응답 120개" }} /> };
