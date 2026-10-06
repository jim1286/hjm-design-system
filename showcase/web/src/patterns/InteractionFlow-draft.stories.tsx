import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReopenDraft } from "./interaction-flow-previews";
const meta = { includeStories: ["Default","Dark","LargeText"], id: "experimental-interaction-draft", title: "배포/구성/입력과 작성/닫았다 열고 초안 이어쓰기", component: ReopenDraft } satisfies Meta<typeof ReopenDraft>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
