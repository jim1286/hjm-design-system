import { useState } from "react";
import { Button, Stack } from "@hjmds/react";
import { StatusText } from "@hjmds/react/status-text";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual Text item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-foundation--text keeps the same preview for old links.
const meta = { id: "components-foundation-text", title: "배포/컴포넌트/글자와 아이콘/본문 글자", component: ContractStory, args: { name: "Text" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

function StatusPreview() {
  const [count, setCount] = useState(0);
  const [failed, setFailed] = useState(false);
  return <Stack gap="sm">
    <StatusText announcement={failed ? "assertive" : "polite"} tone={failed ? "danger" : "muted"}>
      {failed ? "저장하지 못했어요. 다시 시도해 주세요." : count ? `${count}번째 저장을 완료했어요.` : "변경한 내용은 저장 버튼으로 반영해요."}
    </StatusText>
    <Stack axis="inline" gap="xs">
      <Button onClick={() => { setCount(value => value + 1); setFailed(false); }}>저장</Button>
      <Button tone="secondary" onClick={() => setFailed(true)}>실패 보기</Button>
    </Stack>
  </Stack>;
}
export const Status: Story = { name: "상태 알림", render: () => <StatusPreview /> };
