import { useState } from "react";
import { NotificationRow } from "@hjmds/react/screens";
import { Stack, Text } from "@hjmds/react/layout";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual NotificationRow item (2026-10-17 screen compositions registered, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-data-display--notification-row keeps the same preview for old links.
const meta = { id: "components-data-display-notification-row", title: "배포/컴포넌트/데이터 표시/알림 미리보기 행", component: ContractStory, args: { name: "NotificationRow" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
function ActionPreview() {
  const [opened, setOpened] = useState(false);
  return <Stack gap="md">
    <NotificationRow avatar={<Text>🌱</Text>} preview="친구가 새 뚝을 올렸어요" metadata="1분 전" unread
      action={{ label: "친구가 새 뚝을 올렸어요. 1분 전", onActivate: () => setOpened(true) }} />
    <NotificationRow avatar={<Text>🌼</Text>} preview="삭제된 뚝의 알림이에요" metadata="어제" separator
      action={{ label: "삭제된 뚝의 알림이에요. 어제", disabled: true, onActivate: () => setOpened(true) }} />
    <Text role="status">{opened ? "알림을 열었어요" : "첫 알림을 눌러 보세요"}</Text>
  </Stack>;
}
export const Default: Story = { name: "기본", render: () => <ActionPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
