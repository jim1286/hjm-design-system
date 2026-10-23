import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { TextArea } from "@hjmds/react-native/inputs";
import { NativeComponentPreview } from "../component-examples";
import { characterCountExample as copy } from "../../../shared/character-count";
const meta = { title: "배포/컴포넌트/입력/여러 줄 입력", component: NativeComponentPreview, args: { componentId: "text-area", variant: "default" }, parameters: { hjm: { componentIds: ["text-area"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
// characterCount (2026-10-23): BurnTok composer rule — trimmed 5–500, near at 40, typing past the limit is kept.
function CountedTextArea() {
  const [value, setValue] = useState(copy.initial);
  return <TextArea label={copy.label} description={copy.description} value={value} onValueChange={setValue} minVisibleLines={3} characterCount={copy.options} />;
}
export const CharacterCount: Story = { name: "글자 수 표시 · 미게시", render: () => <CountedTextArea /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
