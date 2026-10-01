import type { Meta, StoryObj } from "@storybook/react-vite";
import { UndoRecoveryPreview } from "./action-recovery-previews";
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "experimental-action-undo", title: "실험/구성/공통 동작/보관과 실행 취소", component: UndoRecoveryPreview } satisfies Meta<typeof UndoRecoveryPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
