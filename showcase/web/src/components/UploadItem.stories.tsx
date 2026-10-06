import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual UploadItem item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-data-display--upload-item keeps the same preview for old links.
const meta = { id: "components-data-display-upload-item", title: "배포/컴포넌트/데이터 표시/업로드 항목", component: ContractStory, args: { name: "UploadItem" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
