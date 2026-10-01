import type { Meta, StoryObj } from "@storybook/react-vite";
import { NavigationBehaviorPreview } from "./reference-navigation-bars";
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "experimental-navigation-project", title: "배포/컴포넌트/탐색/내비게이션 바/사각 영역으로 현재 위치 표시", component: NavigationBehaviorPreview, parameters: { controls: { disable: true } }, args: { behavior: "rectangle" } } satisfies Meta<typeof NavigationBehaviorPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
