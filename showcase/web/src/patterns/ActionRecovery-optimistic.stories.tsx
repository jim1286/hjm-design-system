import type { Meta, StoryObj } from "@storybook/react-vite";
import { OptimisticRecoveryPreview } from "./action-recovery-previews";
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "experimental-action-optimistic", title: "실험/구성/공통 동작/즉시 반영과 복구", component: OptimisticRecoveryPreview } satisfies Meta<typeof OptimisticRecoveryPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
