import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarPreview, BottomInfoPreview } from "./Sidebar.previews.js";

const meta = { includeStories: ["Default","StandingConditions","Dark","LargeText"], id: "patterns-sidebar", title: "배포/컴포넌트/탐색/사이드바", component: SidebarPreview } satisfies Meta<typeof SidebarPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const StandingConditions: Story = { name: "고정 조건", render: () => <BottomInfoPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
