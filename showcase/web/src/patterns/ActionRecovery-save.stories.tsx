import type { Meta, StoryObj } from "@storybook/react-vite";
import { SaveRecoveryPreview } from "./action-recovery-previews";
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "experimental-action-save", title: "실험/구성/공통 동작/저장과 재시도", component: SaveRecoveryPreview } satisfies Meta<typeof SaveRecoveryPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
