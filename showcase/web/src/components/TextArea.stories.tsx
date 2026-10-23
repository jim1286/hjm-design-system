import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TextArea } from "@hjmds/react/forms";
import { ContractStory } from "./preview-registry";
import { characterCountExample as copy } from "../../../shared/character-count";

// Individual TextArea item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-inputs--text-area keeps the same preview for old links.
const meta = { id: "components-inputs-text-area", title: "배포/컴포넌트/입력/여러 줄 입력", component: ContractStory, args: { name: "TextArea" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
// characterCount (2026-10-23): BurnTok composer rule — trimmed 5–500, near at 40, typing past the limit is kept.
function CountedTextArea() {
  const [value, setValue] = useState(copy.initial);
  return <TextArea label={copy.label} description={copy.description} value={value} onChange={(event) => setValue(event.currentTarget.value)}
    minVisibleLines={3} characterCount={copy.options} />;
}
export const CharacterCount: Story = { name: "글자 수 표시 · 미게시", render: () => <CountedTextArea /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
