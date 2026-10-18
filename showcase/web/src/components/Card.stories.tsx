import { useState } from "react";
import { Card, Icon, IconButton, Text } from "@hjmds/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual Card item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-data-display--card keeps the same preview for old links.
const meta = { id: "components-data-display-card", title: "배포/컴포넌트/데이터 표시/카드", component: ContractStory, args: { name: "Card" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };

function OpenAndDeletePreview() {
  const [opened, setOpened] = useState(0);
  const [deleted, setDeleted] = useState(false);
  if (deleted) return <Text tone="muted">항공편을 삭제했어요.</Text>;
  // Whole-card open with an independent delete: the card is one target, the delete IconButton another.
  return <Card aria-label="KE123 인천에서 도쿄, 10월 20일" title="ICN → NRT" description="KE123 · 10월 20일" onActivate={() => setOpened(count => count + 1)}
    actions={<IconButton label="KE123 삭제" tone="ghost" size="small" edge="start" onClick={() => setDeleted(true)}><Icon name="delete" tone="danger" /></IconButton>}>
    <Text tone="muted" variant="label">{opened ? `${opened}번 열었어요` : "카드를 눌러 열어 보세요"}</Text>
  </Card>;
}
export const OpenWithActions: Story = { name: "열기와 따로 삭제", render: () => <OpenAndDeletePreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
