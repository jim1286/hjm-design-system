import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "@hjmds/react/forms";
import { Button } from "@hjmds/react/actions";
import { Container, Stack, Section, Text } from "@hjmds/react/layout";
import { Notice } from "@hjmds/react/feedback";
import { hourOptions, minuteOptions, selectedTime } from "../../../shared/time-example.js";
export function TimeSelectionPreview() {
  const [hour, setHour] = useState<string | null>(null); const [minute, setMinute] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null); const value = selectedTime(hour, minute);
  return <Container gutter="compact"><Section title="하루를 마무리할 시간" description="편한 시각을 골라주세요. 24시간 기준이에요."><Stack gap="md">
    <Select label="시" placeholder="시 선택" emptySelectionLabel="시 선택 해제" items={hourOptions} selectedKey={hour} onSelectionChange={(next) => { setHour(next); setSaved(null); }} />
    <Select label="분" placeholder="분 선택" emptySelectionLabel="분 선택 해제" items={minuteOptions} selectedKey={minute} onSelectionChange={(next) => { setMinute(next); setSaved(null); }} />
    <Text role="status">{value ? `선택한 시각 ${value}` : "시와 분을 모두 선택해 주세요."}</Text>
    <Button disabled={!value} onClick={() => setSaved(value)}>선택 완료</Button>
    <Button tone="ghost" onClick={() => { setHour(null); setMinute(null); setSaved(null); }}>다시 고르기</Button>
    {saved ? <Notice tone="success" title="시간을 정했어요" description={saved} /> : null}
  </Stack></Section></Container>;
}
const meta = { includeStories: ["Default","Dark","LargeText"], id: "patterns-time-selection", title: "배포/구성/선택과 필터/시간 선택", component: TimeSelectionPreview } satisfies Meta<typeof TimeSelectionPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
