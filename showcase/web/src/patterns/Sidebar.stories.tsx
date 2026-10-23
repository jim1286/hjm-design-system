import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarPreview, BottomInfoPreview } from "./Sidebar.previews.js";

const meta = { includeStories: ["Default","Compact","StandingConditions","Dark","LargeText"], id: "patterns-sidebar", title: "배포/컴포넌트/탐색/사이드바", component: SidebarPreview } satisfies Meta<typeof SidebarPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
// size="compact" (2026-10-23): the 220 open width for a short product rail.
export const Compact: Story = { name: "좁은 폭 · 미게시", render: () => <SidebarPreview size="compact" /> };
export const StandingConditions: Story = { name: "고정 조건", render: () => <BottomInfoPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
