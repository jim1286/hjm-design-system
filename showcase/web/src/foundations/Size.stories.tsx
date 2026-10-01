import type { Meta, StoryObj } from "@storybook/react-vite";
import { DimensionTokens } from "./token-reference-previews";
const meta = { id: "foundations-size", title: "배포/토큰/크기", component: DimensionTokens, args: {kind: "size"}, parameters: {controls: {disable: true}} } satisfies Meta<typeof DimensionTokens>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: {theme:"dark"} };
export const LargeText: Story = { name: "큰 글자", globals: {textScale:"2"} };
