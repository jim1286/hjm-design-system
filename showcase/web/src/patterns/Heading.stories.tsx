import type { Meta, StoryObj } from "@storybook/react-vite";
import { HeadingPreview, ProgressRingPreview, ListRowLoadingPreview } from "./Heading.previews.js";

const meta = { includeStories: ["Default","ProgressRing","LoadingRows","Dark","LargeText"], id: "patterns-heading", title: "배포/컴포넌트/글자와 아이콘/제목", component: HeadingPreview } satisfies Meta<typeof HeadingPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const ProgressRing: Story = { name: "원형 진행 표시", render: () => <ProgressRingPreview /> };
export const LoadingRows: Story = { name: "목록 로딩", render: () => <ListRowLoadingPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
