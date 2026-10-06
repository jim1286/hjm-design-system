import type { Meta, StoryObj } from "@storybook/react-vite";
import { AssetPreview } from "./Asset.previews.js";

const meta = { includeStories: ["Default","Dark","LargeText","ReducedMotion"], id: "patterns-asset", title: "배포/컴포넌트/데이터 표시/이미지·영상 표시", component: AssetPreview } satisfies Meta<typeof AssetPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const ReducedMotion: Story = { name: "동작 줄이기", globals: { motion: "reduced" } };
