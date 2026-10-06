import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnimatedStatistic } from "@hjmds/react/statistic-motion";
import { Button } from "@hjmds/react/actions";
import { Stack } from "@hjmds/react/layout";

function Preview({ locale = "ko-KR", format, initialValue = 1280, label = "이번 주 기록" }: { locale?: string; format?: Intl.NumberFormatOptions; initialValue?: number; label?: string }) {
  const [value, setValue] = useState(initialValue);
  // Reference count-up demos expose intermediate values. Keep the actual value
  // and locale here so the comparison cannot suggest fabricated product counts.
  return <Stack gap="xl">
    <AnimatedStatistic descriptor={{ id: "weekly-records", label, hint: "로컬 예제 데이터" }} value={value} locale={locale} {...(format ? { format } : {})} />
    <Stack axis="inline" gap="sm" wrap>
      <Button tone="secondary" onClick={() => setValue(current => current - 125)}>줄이기</Button>
      <Button onClick={() => setValue(current => current + 125)}>늘리기</Button>
      <Button tone="secondary" onClick={() => setValue(0)}>0으로</Button>
    </Stack>
  </Stack>;
}
const meta = { includeStories: ["Default", "Decimal", "NonLatinDigits", "Scientific", "Dark", "LargeText", "ReducedMotion", "Rtl"], id: "components-display-animated-statistic", title: "배포/컴포넌트/데이터 표시/움직이는 수치", component: Preview } satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Decimal: Story = { name: "소수와 음수", args: { label: "측정값", locale: "de-DE", initialValue: -1234.5, format: { minimumFractionDigits: 2, maximumFractionDigits: 2 } } };
export const NonLatinDigits: Story = { name: "비라틴 숫자", args: { label: "측정값", locale: "ar-EG", initialValue: 1234.5, format: { maximumFractionDigits: 2 } } };
export const Scientific: Story = { name: "지수 표기", args: { label: "측정값", locale: "en-US", initialValue: 12345, format: { notation: "scientific" } } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const ReducedMotion: Story = { name: "동작 줄이기", globals: { motion: "reduced" } };
export const Rtl: Story = { name: "오른쪽에서 왼쪽", globals: { direction: "rtl" } };
