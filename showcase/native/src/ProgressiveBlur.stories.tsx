import type { Meta, StoryObj } from "@storybook/react-native";
import { ProgressiveBlurPreview } from "./progressive-blur-preview";
// Native Storybook 10.4.4 filters default metadata through includeStories; omit it.
const meta = { title: "실험/컴포넌트/시각 효과/가장자리 흐림", component: ProgressiveBlurPreview } satisfies Meta<typeof ProgressiveBlurPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
