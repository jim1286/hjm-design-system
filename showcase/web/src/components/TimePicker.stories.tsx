import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { useState } from "react";
import { TimePicker } from "@hjmds/react/time-picker";
import { timePickerWheelExample } from "../../../shared/time-example.js";
const meta = { id: "components-inputs-time-picker", title: "배포/컴포넌트/입력/시각 선택", component: ContractStory, args: { name: "TimePicker" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
function WheelPreview({ inline = false }: { inline?: boolean }) {
  const [value, setValue] = useState<string | null>(timePickerWheelExample.value);
  return <TimePicker {...timePickerWheelExample} value={value} onValueChange={setValue} selectionStyle="wheel" presentation={inline ? "inline" : "field"} />;
}
export const Wheel: Story = { name: "휠 선택", render: () => <WheelPreview /> };
export const WheelInline: Story = { name: "본문 안 휠 선택", render: () => <WheelPreview inline /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const WheelReducedMotion: Story = { name: "휠 선택 · 동작 줄이기", globals: { motion: "reduced" }, render: () => <WheelPreview inline /> };
