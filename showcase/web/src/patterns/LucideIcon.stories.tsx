import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icons } from "./visual-previews";
const meta = { includeStories: ["Default","Dark","LargeText"], id: "components-display-lucide-icon", title: "배포/컴포넌트/글자와 아이콘/루시드 아이콘", component: Icons, parameters: { hjm: { optionalEntry: "icon-lucide" } } } satisfies Meta<typeof Icons>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
