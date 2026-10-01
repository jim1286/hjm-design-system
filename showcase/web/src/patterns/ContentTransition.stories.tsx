import type { Meta, StoryObj } from "@storybook/react-vite";
import { Transitions } from "./visual-previews";
const meta = { includeStories: ["Default","Dark","LargeText"], id: "components-display-content-transition", title: "배포/컴포넌트/시각 효과/내용 전환", component: Transitions, parameters: { hjm: { optionalEntry: "content-transition" } } } satisfies Meta<typeof Transitions>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
