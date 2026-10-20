import { ListSeparator } from "@hjmds/react/display";
import { Text } from "@hjmds/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual List item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-data-display--list keeps the same preview for old links.
const meta = { id: "components-data-display-list", title: "배포/컴포넌트/데이터 표시/목록", component: ContractStory, args: { name: "List" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

export const StandaloneSeparators: Story = {
  name: "독립 구분선",
  render: () => <div style={{ padding: 16, display: "grid", gap: 16 }}>
    <Text>행 자체에 여백이 있는 목록</Text><ListSeparator />
    <Text>ListRow의 전체 표면</Text><ListSeparator separator="full" />
    <Text>앞 아이콘 다음 글자 열</Text><ListSeparator separator="indented" leading />
  </div>,
};
