import { Card, StatisticGroup } from "@hjmds/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual Statistic item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-data-display--statistic keeps the same preview for old links.
const meta = { id: "components-data-display-statistic", title: "배포/컴포넌트/데이터 표시/수치 표시", component: ContractStory, args: { name: "Statistic" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Bar: Story = { name: "한 줄 통계 바", render: () => <Card padding="sm"><StatisticGroup label="활동 요약" arrangement="bar"
  descriptor={{ items: [{ id: "views", label: "조회", value: "120" }, { id: "comments", label: "댓글", value: "0" }, { id: "shares", label: "공유", value: "8" }] }} /></Card> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
