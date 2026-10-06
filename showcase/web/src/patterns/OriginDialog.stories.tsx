import type { Meta, StoryObj } from "@storybook/react-vite";
import { OriginDialogPreview, OriginPopoverPreview } from "./origin-dialog-preview";
const meta = { includeStories: ["Default", "Contextual", "Dark", "LargeText", "ContextualDark", "ContextualLargeText"], id: "compositions-input-origin-dialog", title: "배포/구성/입력과 작성/버튼에서 이어지는 편집", component: OriginDialogPreview } satisfies Meta<typeof OriginDialogPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
// Native retains the modal editor; Popover is a Web-only contextual surface.
export const Contextual: Story = { name: "페이지 안에서 편집", render: () => <OriginPopoverPreview/> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

export const ContextualDark: Story = { name: "페이지 안에서 편집 · 어두운 테마", render: () => <OriginPopoverPreview/>, globals: { theme: "dark" } };
export const ContextualLargeText: Story = { name: "페이지 안에서 편집 · 큰 글자", render: () => <OriginPopoverPreview/>, globals: { textScale: "2" } };
