import type { Meta, StoryObj } from "@storybook/react-native";
import { ActivityStatusPreview } from "./activity-status-preview";
const meta = { title: "실험/구성/피드백과 복구/백그라운드 작업 상태", component: ActivityStatusPreview } satisfies Meta<typeof ActivityStatusPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Pending: Story = { name: "처리 중", args: { initial: "running" } };
export const Dark: Story = { name: "어두운 테마", args: { initial: "running" }, globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", args: { initial: "running" }, globals: { textScale: "2" } };
