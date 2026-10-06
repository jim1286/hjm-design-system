import type { Meta, StoryObj } from "@storybook/react-vite";
import { OnboardingFlowPreview } from "./screen-flow-previews";
// 2026-10-06 decision: the directly assembled onboarding was replaced by the OnboardingScreen-based flow
// (formerly 실험/화면/기본 흐름/온보딩). This file keeps the deployed id patterns-onboarding; the absorbed ids
// screen-flow-onboarding--* are retired in story-ids.json. Topics opens the same OnboardingScreen at its multi-select
// topic step, like Native; the hand-assembled Steps/ContentTransition copy was removed instead of kept as a second frame.
const meta = { id: "patterns-onboarding", title: "배포/화면/소개/온보딩", component: OnboardingFlowPreview } satisfies Meta<typeof OnboardingFlowPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Topics: Story = { name: "관심 주제 고르기", args: { initialStep: 1 } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const Recovery: Story = { name: "실패와 복구", args: { tools: true } };
