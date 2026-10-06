import type { Meta, StoryObj } from "@storybook/react-native";
import { RecordComparison } from "./reference-flow-previews";
// New reference-derived compositions remain experimental until explicit user approval.
const meta = { title: "실험/화면/표현 비교/같은 기록의 세 가지 구성", component: RecordComparison } satisfies Meta<typeof RecordComparison>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
