import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { IconButtonStatePreview } from "./component-state-previews";

// Individual IconButton item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-actions--icon-button keeps the same preview for old links.
const meta = { id: "components-actions-icon-button", title: "배포/컴포넌트/동작/아이콘 버튼", component: ContractStory, args: { name: "IconButton" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Pending: Story = { name: "처리 중", render: () => <IconButtonStatePreview state="pending" /> };
export const Disabled: Story = { name: "비활성", render: () => <IconButtonStatePreview state="disabled" /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
