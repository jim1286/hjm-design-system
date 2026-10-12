import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActivityChipPreview } from "./activity-status-preview";
const meta = { id: "activity-chip", title: "실험/컴포넌트/상태와 알림/작업 상태 칩", component: ActivityChipPreview } satisfies Meta<typeof ActivityChipPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
