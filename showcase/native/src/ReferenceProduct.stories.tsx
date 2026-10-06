import type { Meta, StoryObj } from "@storybook/react-native";
import { ProductIntroduction } from "./reference-flow-previews";
// New reference-derived compositions remain experimental until explicit user approval.
const meta = { title: "실험/화면/서비스 소개/제품 체험 중심", component: ProductIntroduction } satisfies Meta<typeof ProductIntroduction>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
