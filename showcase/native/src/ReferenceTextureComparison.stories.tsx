import type { Meta, StoryObj } from "@storybook/react-native";
import { TextureComparisonPreview } from "./texture-comparison-preview";
const meta = { title: "배포/구성/정보 표시/질감 비교", component: TextureComparisonPreview, parameters: { hjm: { optionalEntry: "effect-surface" } } } satisfies Meta<typeof TextureComparisonPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
