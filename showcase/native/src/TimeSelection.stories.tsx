import { PatternStatus } from "./pattern-status";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { Select } from "@hjmds/react-native/forms";
import { Button } from "@hjmds/react-native/actions";
import { Container, Section, Stack } from "@hjmds/react-native/primitives";
import { ScrollView } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { Notice } from "@hjmds/react-native/feedback";
// Metro resolves the shared TypeScript source by extension; a literal .js path has no file.
import { hourOptions, minuteOptions, selectedTime } from "../../shared/time-example";
function TimeSelectionPreview() {
  const [hour, setHour] = useState<string | null>(null); const [minute, setMinute] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null); const value = selectedTime(hour, minute);
  return <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}><Container gutter="compact"><Section title="하루를 마무리할 시간" description="편한 시각을 골라주세요. 24시간 기준이에요."><Stack gap="md">
    <Select label="시" placeholder="시 선택" dismissLabel="시 선택 닫기" items={hourOptions} selectedKey={hour} onSelectionChange={(next) => { setHour(next); setSaved(null); }} />
    <Select label="분" placeholder="분 선택" dismissLabel="분 선택 닫기" items={minuteOptions} selectedKey={minute} onSelectionChange={(next) => { setMinute(next); setSaved(null); }} />
    <PatternStatus>{value ? `선택한 시각 ${value}` : "시와 분을 모두 선택해 주세요."}</PatternStatus>
    <Button disabled={!value} onPress={() => setSaved(value)}>선택 완료</Button>
    <Button tone="ghost" onPress={() => { setHour(null); setMinute(null); setSaved(null); }}>다시 고르기</Button>
    {saved ? <Notice tone="success" announcement="polite" title="시간을 정했어요" description={saved} /> : null}
  </Stack></Section></Container></ScrollView>;
}
const meta = { title: "배포/구성/선택과 필터/시간 선택", component: TimeSelectionPreview } satisfies Meta<typeof TimeSelectionPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
