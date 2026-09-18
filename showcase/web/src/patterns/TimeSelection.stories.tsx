import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "@hjmds/react/forms";
import { Button } from "@hjmds/react/actions";
import { Stack, Section } from "@hjmds/react/layout";
import { Notice } from "@hjmds/react/feedback";
import { hourOptions, minuteOptions, selectedTime } from "../../../shared/time-example.js";
export function TimeSelectionPreview() {
  const [hour, setHour] = useState<string | null>(null); const [minute, setMinute] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null); const value = selectedTime(hour, minute);
  return <Section title="하루를 마무리할 시간" description="편한 시각을 골라주세요. 24시간 기준이에요."><Stack gap="md">
    <Select label="시" placeholder="시 선택" emptySelectionLabel="시 선택 해제" items={hourOptions} selectedKey={hour} onSelectionChange={(next) => { setHour(next); setSaved(null); }} />
    <Select label="분" placeholder="분 선택" emptySelectionLabel="분 선택 해제" items={minuteOptions} selectedKey={minute} onSelectionChange={(next) => { setMinute(next); setSaved(null); }} />
    <div role="status">{value ? `선택한 시각 ${value}` : "시와 분을 모두 선택해 주세요."}</div>
    <Button disabled={!value} onClick={() => setSaved(value)}>선택 완료</Button>
    <Button tone="ghost" onClick={() => { setHour(null); setMinute(null); setSaved(null); }}>다시 고르기</Button>
    {saved ? <Notice tone="success" title="시간을 정했어요" description={saved} /> : null}
  </Stack></Section>;
}
const meta = { title: "Patterns/Time selection", component: TimeSelectionPreview } satisfies Meta<typeof TimeSelectionPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ChooseTime: Story = {};
export const LargeText: Story = { globals: { textScale: "2" } };
