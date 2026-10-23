import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { CheckboxGroup } from "@hjmds/react-native/inputs";
import { chipRailExample as copy } from "../../../shared/checkbox-group-overflow";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/입력/체크박스 그룹", component: NativeComponentPreview, args: { componentId: "checkbox-group", variant: "default" }, parameters: { hjm: { componentIds: ["checkbox-group"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
// overflow="scroll" (2026-10-23): multi-select chips on one scrolling line, Yajalal's team filter.
function ChipRailPreview() {
  const [value, setValue] = useState<ReadonlySet<string>>(() => new Set(copy.initial));
  return <CheckboxGroup label={copy.label} presentation="chips" size="small" overflow="scroll" items={copy.items} value={value} onValueChange={setValue} />;
}
export const ChipRail: Story = { name: "칩 한 줄 스크롤 · 미게시", render: () => <ChipRailPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
