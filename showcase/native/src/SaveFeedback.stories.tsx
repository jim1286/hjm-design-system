import type { Meta, StoryObj } from "@storybook/react-native";
import { SaveFeedbackPreview } from "./save-feedback-preview";

const meta = { title: "실험/구성/피드백과 복구/저장 결과", component: SaveFeedbackPreview, args: { variant: "compact" } } satisfies Meta<typeof SaveFeedbackPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "컴팩트 토스트" };
export const Summary: Story = { name: "대상 요약 토스트", args: { variant: "summary" } };
export const Inline: Story = { name: "저장 카드에 바로 반영", args: { variant: "inline" } };
export const Dark: Story = { name: "어두운 테마", args: { variant: "inline" }, globals: { theme: "dark" } };
