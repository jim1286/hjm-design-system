import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartGalleryPreview } from "./Chart.previews";

const meta = { id: "components-data-display-chart", title: "실험/컴포넌트/데이터 표시/차트", component: ChartGalleryPreview } satisfies Meta<typeof ChartGalleryPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Line: Story = { name: "꺾은선", args: { only: "line" } };
export const Bar: Story = { name: "막대", args: { only: "bar" } };
export const HorizontalBar: Story = { name: "가로 막대", args: { only: "horizontal" } };
export const StackedBar: Story = { name: "누적 막대", args: { only: "stacked" } };
export const Pie: Story = { name: "파이", args: { only: "pie" } };
export const Radar: Story = { name: "레이더", args: { only: "radar" } };
export const Scatter: Story = { name: "산점도", args: { only: "scatter" } };
export const SparklineStory: Story = { name: "스파크라인", args: { only: "sparkline" } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
