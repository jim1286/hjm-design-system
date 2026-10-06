import type { Meta, StoryObj } from "@storybook/react-native";
import { OnboardingFlowPreview } from "./screen-flow-previews";
// 2026-10-06: the released hand-assembled onboarding was replaced by the OnboardingScreen-based flow. Its unique
// state, choosing interests, stays as the Topics story that opens that step directly (FINAL_MAPPING §2).
const meta = { title: "배포/화면/소개/온보딩", component: OnboardingFlowPreview } satisfies Meta<typeof OnboardingFlowPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Topics: Story = { name: "관심 주제 고르기", args: { initialStep: 1 } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const Recovery: Story = { name: "실패와 복구", args: { tools: true } };
