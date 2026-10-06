import type { Meta, StoryObj } from "@storybook/react-vite";
import { OriginDialogPreview } from "./origin-dialog-preview";
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "compositions-input-origin-dialog", title: "실험/구성/입력과 작성/버튼에서 이어지는 편집", component: OriginDialogPreview } satisfies Meta<typeof OriginDialogPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
