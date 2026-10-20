import { useState } from "react";
import { IconTile } from "@hjmds/react/screens";
import { Stack, Text } from "@hjmds/react/layout";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual IconTile item (2026-10-17 screen compositions registered, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-data-display--icon-tile keeps the same preview for old links.
const meta = { id: "components-data-display-icon-tile", title: "배포/컴포넌트/데이터 표시/아이콘 타일", component: ContractStory, args: { name: "IconTile" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본", render: () => <ActivationPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

function ActivationPreview() {
  const [opened, setOpened] = useState(0);
  return <Stack gap="sm"><div style={{ width: 88 }}><IconTile label="예시 도구" activationLabel="예시 도구 열기"
    icon={<span>★</span>} onActivate={() => setOpened(value => value + 1)} /></div>
    <Text>{opened ? `${opened}번 열었어요` : "아이콘과 제목을 함께 눌러 보세요"}</Text></Stack>;
}
