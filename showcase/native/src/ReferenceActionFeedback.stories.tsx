import type { Meta, StoryObj } from "@storybook/react-native";
import { ActionFeedbackPreview } from "./reference-adoption-previews";
const meta = { title: "실험/구성/피드백과 복구/버튼 완료 피드백", component: ActionFeedbackPreview } satisfies Meta<typeof ActionFeedbackPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
