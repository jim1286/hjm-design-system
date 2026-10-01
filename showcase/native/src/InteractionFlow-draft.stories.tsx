import type { Meta, StoryObj } from "@storybook/react-native";
import { ReopenDraft } from "./interaction-flow-previews";
const meta = { title: "실험/구성/상호작용 예제/닫았다 열고 초안 이어쓰기", component: ReopenDraft } satisfies Meta<typeof ReopenDraft>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
