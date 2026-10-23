import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/데이터 표시/타임라인", component: NativeComponentPreview, args: { componentId: "timeline", variant: "default" }, parameters: { hjm: { componentIds: ["timeline"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

import { useState } from 'react';
import { Timeline } from '@hjmds/react-native/data-display';
// selectedId/onSelectedIdChange (2026-10-23): each record is a selected-state button HJM owns
// (Diairy rebuilt it with Button tone toggles + accessibilityState.selected).
function SelectableTimeline() {
  const [selected, setSelected] = useState<string | null>('b');
  return <Timeline selectedId={selected} onSelectedIdChange={setSelected}
    composeAccessibleName={({ position, label }) => `${position}단계 · ${label}`}
    items={[{ id: 'a', label: '편지를 띄웠어요', timestamp: '9:00' }, { id: 'b', label: '바다를 건넜어요', description: '갈매기가 이어받았어요', timestamp: '13:20' }, { id: 'c', label: '도착했어요', timestamp: '18:05' }]} />;
}
export const Selectable: Story = { name: '항목 선택', render: () => <SelectableTimeline /> };
