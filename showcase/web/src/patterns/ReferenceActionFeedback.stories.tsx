import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActionFeedbackPreview } from "./reference-adoption-previews";
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "reference-adoption-actionfeedback", title: "배포/구성/피드백과 복구/버튼 완료 피드백", component: ActionFeedbackPreview } satisfies Meta<typeof ActionFeedbackPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
