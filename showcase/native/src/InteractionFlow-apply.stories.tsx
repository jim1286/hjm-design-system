import type { Meta, StoryObj } from "@storybook/react-native";
import { ApplyOrDiscardSelection } from "./interaction-flow-previews";
const meta = { title: "실험/구성/상호작용 예제/선택 후 적용·취소", component: ApplyOrDiscardSelection } satisfies Meta<typeof ApplyOrDiscardSelection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
