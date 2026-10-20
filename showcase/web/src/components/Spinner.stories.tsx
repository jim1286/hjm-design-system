import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual Spinner item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-feedback--spinner keeps the same preview for old links.
const meta = { id: "components-feedback-spinner", title: "배포/컴포넌트/상태와 알림/로딩 표시", component: ContractStory, args: { name: "Spinner" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

import { useState } from "react";
import { PendingContent } from "@hjmds/react/feedback";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
function PendingRegionExample() {
  const [pending, setPending] = useState(false);
  return <><Button onClick={() => setPending(!pending)}>{pending ? "대기 취소" : "대기 시작"}</Button>
    <PendingContent pending={pending} label="연결 중"><TextField label="보존할 초안" defaultValue="작성 중인 내용" /></PendingContent></>;
}
export const PendingRegion: Story = { name: "입력을 보존하는 대기 영역", render: () => <PendingRegionExample /> };
