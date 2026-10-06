import type { Meta, StoryObj } from "@storybook/react-native";
import { OnboardingFlowPreview } from "./screen-flow-previews";
const meta = { title: "실험/화면/기본 흐름/온보딩", component: OnboardingFlowPreview } satisfies Meta<typeof OnboardingFlowPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: {theme:"dark"} };
export const LargeText: Story = { name: "큰 글자", globals: {textScale:"2"} };
export const Recovery: Story = { name: "복구 흐름", args: {tools:true} };
