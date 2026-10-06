import type { Meta, StoryObj } from "@storybook/react-native";
import { FirstTask } from "./reference-flow-previews";
// New reference-derived compositions remain experimental until explicit user approval.
const meta = { title: "실험/구성/시작하기/첫 작업을 만들고 이어하기", component: FirstTask } satisfies Meta<typeof FirstTask>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
