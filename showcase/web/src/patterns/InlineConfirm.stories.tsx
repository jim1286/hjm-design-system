import type { Meta, StoryObj } from "@storybook/react-vite";
import { Confirm } from "./compound-previews";
const meta = { includeStories: ["Default","Dark","LargeText"], id: "components-actions-inline-confirm", title: "배포/컴포넌트/동작/버튼 안에서 확인", component: Confirm, parameters: { hjm: { optionalEntry: "inline-confirm" } } } satisfies Meta<typeof Confirm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
