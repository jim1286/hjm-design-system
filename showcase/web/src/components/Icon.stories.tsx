import { Icon, Stack, Text } from "@hjmds/react";
import { semanticIconNames } from "@hjmds/design-contracts/components/icon";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual Icon item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-foundation--icon keeps the same preview for old links.
const meta = { id: "components-foundation-icon", title: "배포/컴포넌트/글자와 아이콘/아이콘", component: ContractStory, args: { name: "Icon" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
// Every shared semantic mark, including the reorder pair, rotate and unblock added for product tool rows (1.31).
export const SemanticSet: Story = {
  name: "전체 기호",
  render: () => <Stack axis="inline" gap="md" wrap>
    {semanticIconNames.map(name => <Stack key={name} gap="xxs" align="center" layoutStyle={{ width: 88 }}>
      <Icon name={name} tone="primary" />
      <Text variant="caption" tone="muted">{name}</Text>
    </Stack>)}
  </Stack>,
};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
