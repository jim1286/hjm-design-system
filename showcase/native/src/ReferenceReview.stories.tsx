import type { Meta, StoryObj } from "@storybook/react-native";
import { SelectionReview } from "./reference-flow-previews";
// New reference-derived compositions remain experimental until explicit user approval.
const meta = { title: "실험/구성/확인/선택 내용 검토와 수정", component: SelectionReview } satisfies Meta<typeof SelectionReview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
