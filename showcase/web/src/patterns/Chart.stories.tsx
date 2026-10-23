import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartGalleryPreview } from "./Chart.previews";

const meta = { id: "components-data-display-chart", title: "배포/컴포넌트/데이터 표시/차트", component: ChartGalleryPreview } satisfies Meta<typeof ChartGalleryPreview>;
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

import { ChartLegend } from "@hjmds/react/chart";
// ChartLegend layout="inline" (2026-10-23): a one-line key that wraps, e.g. under a map (Choose-window).
export const InlineLegend: Story = { name: "한 줄 범례", render: () => <div style={{ maxWidth: 360 }}>
  <ChartLegend layout="inline" items={[{ id: "left", label: "왼쪽 햇빛", color: "#f59e0b" }, { id: "right", label: "오른쪽 햇빛", color: "#3b82f6" }, { id: "none", label: "그늘", color: "#94a3b8" }]} />
</div> };
