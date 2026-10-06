import type { Meta, StoryObj } from "@storybook/react-vite";
import { SplitterPreview, VerticalSplitterPreview } from "./Splitter.previews.js";

const meta = { includeStories: ["Default","VerticalAxis","Dark","LargeText"], id: "patterns-splitter", title: "배포/컴포넌트/레이아웃/분할 영역 조절", component: SplitterPreview } satisfies Meta<typeof SplitterPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const VerticalAxis: Story = { name: "세로 축", render: () => <VerticalSplitterPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
