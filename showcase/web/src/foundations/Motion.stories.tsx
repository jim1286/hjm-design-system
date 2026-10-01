import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionTokens } from "./token-reference-previews";
const meta = { id: "foundations-motion", title: "배포/토큰/모션", component: MotionTokens } satisfies Meta<typeof MotionTokens>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: {theme:"dark"} };
export const LargeText: Story = { name: "큰 글자", globals: {textScale:"2"} };
