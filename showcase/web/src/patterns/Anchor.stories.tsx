import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnchorPreview } from "./Anchor.previews.js";

const meta = { includeStories: ["Default","Vertical","Dark","LargeText"], id: "patterns-anchor", title: "배포/컴포넌트/탐색/문서 내 바로가기", component: AnchorPreview } satisfies Meta<typeof AnchorPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Vertical: Story = { name: "세로 배치", args: { horizontal: false } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
