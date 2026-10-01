import type { Meta, StoryObj } from "@storybook/react-native";
import { Effects } from "./visual-previews";
const meta = { title: "배포/컴포넌트/시각 효과/배경 시각 효과", component: Effects, parameters: { hjm: { optionalEntry: "effect-surface" } } } satisfies Meta<typeof Effects>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
