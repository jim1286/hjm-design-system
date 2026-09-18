import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { Select } from "@hjmds/react-native/forms";
import { Button } from "@hjmds/react-native/actions";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { Notice } from "@hjmds/react-native/feedback";
import { hourOptions, minuteOptions, selectedTime } from "../../shared/time-example.js";
function TimeSelectionPreview() {
  const [hour, setHour] = useState<string | null>(null); const [minute, setMinute] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null); const value = selectedTime(hour, minute);
  return <Stack gap="md"><Text variant="title" emphasis="strong">하루를 마무리할 시간</Text><Text tone="muted">편한 시각을 골라주세요. 24시간 기준이에요.</Text>
    <Select label="시" placeholder="시 선택" dismissLabel="시 선택 닫기" items={hourOptions} selectedKey={hour} onSelectionChange={(next) => { setHour(next); setSaved(null); }} />
    <Select label="분" placeholder="분 선택" dismissLabel="분 선택 닫기" items={minuteOptions} selectedKey={minute} onSelectionChange={(next) => { setMinute(next); setSaved(null); }} />
    <Text accessibilityLiveRegion="polite">{value ? `선택한 시각 ${value}` : "시와 분을 모두 선택해 주세요."}</Text>
    <Button disabled={!value} onPress={() => setSaved(value)}>선택 완료</Button>
    <Button tone="ghost" onPress={() => { setHour(null); setMinute(null); setSaved(null); }}>다시 고르기</Button>
    {saved ? <Notice tone="success" title="시간을 정했어요" description={saved} /> : null}
  </Stack>;
}
const meta = { title: "Patterns/Time selection", component: TimeSelectionPreview } satisfies Meta<typeof TimeSelectionPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ChooseTime: Story = {};
