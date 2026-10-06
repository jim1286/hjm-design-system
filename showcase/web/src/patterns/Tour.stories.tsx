import type { Meta, StoryObj } from "@storybook/react-vite";
import { TourPreview } from "./Tour.previews.js";

const meta = { includeStories: ["Default","Dark","LargeText"], id: "patterns-tour", title: "배포/컴포넌트/오버레이/사용 안내 둘러보기", component: TourPreview } satisfies Meta<typeof TourPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
