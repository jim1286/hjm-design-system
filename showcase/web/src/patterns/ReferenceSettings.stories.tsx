import type { Meta, StoryObj } from "@storybook/react-vite";
import { RecoverableSettings } from "./reference-flow-previews";
// New reference-derived compositions remain experimental until explicit user approval.
const meta = { includeStories: ["Default","Dark","LargeText"], id: "reference-settings", title: "배포/구성/피드백과 복구/변경 저장과 이탈 확인", component: RecoverableSettings } satisfies Meta<typeof RecoverableSettings>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
