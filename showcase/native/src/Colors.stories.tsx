import type { Meta, StoryObj } from "@storybook/react-native";
import { ColorTokens } from "./token-reference-previews";
const meta = { title: "배포/토큰/색과 글자/색상", component: ColorTokens } satisfies Meta<typeof ColorTokens>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: {theme:"dark"} };
export const LargeText: Story = { name: "큰 글자", globals: {textScale:"2"} };
