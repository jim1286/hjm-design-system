import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Rating } from "@hjmds/react/rating";
import { Button } from "@hjmds/react/actions";
import { Stack, Section, Text } from "@hjmds/react/layout";
import { Notice } from "@hjmds/react/feedback";
import { ratingExample as copy } from "../../../shared/component-examples.js";
// 2026-10-17 review: this "별점" story showed a Slider; it now renders HJM Rating like the Native story.
export function RatingPreview() {
  const [score, setScore] = useState<number | null>(copy.initial); const [saved, setSaved] = useState<number | null>(null);
  return <Section title={copy.title} description={copy.description}><Stack gap="md">
    <Rating label={copy.label} value={score} onValueChange={(value) => { setScore(value); setSaved(null); }} getValueLabel={copy.valueLabel} clearLabel={copy.clearLabel} />
    <Button disabled={score === null} onClick={() => setSaved(score)}>{copy.save}</Button>
    {saved !== null ? <Notice tone="success" title={copy.saved(saved)} /> : null}
  </Stack></Section>;
}
function AveragePreview({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return <Stack gap="xs"><Rating label={label} value={value} readOnly getValueLabel={copy.valueLabel} />{hint ? <Text tone="muted" variant="caption">{hint}</Text> : null}</Stack>;
}
const meta = { includeStories: ["Default","HalfPoint","ReadOnlyAverage","Dark","LargeText"], id: "patterns-rating", title: "배포/컴포넌트/입력/별점", component: RatingPreview } satisfies Meta<typeof RatingPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const HalfPoint: Story = { name: "반점 단위", render: () => <AveragePreview label={copy.half.label} value={copy.half.value} /> };
export const ReadOnlyAverage: Story = { name: "평균 점수 표시", render: () => <AveragePreview label={copy.average.label} value={copy.average.value} hint={copy.average.hint} /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
