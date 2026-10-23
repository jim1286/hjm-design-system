import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual Badge item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-data-display--badge keeps the same preview for old links.
const meta = { id: "components-data-display-badge", title: "배포/컴포넌트/데이터 표시/배지", component: ContractStory, args: { name: "Badge" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

import { Badge } from '@hjmds/react/display';
// categoryColor (2026-10-23): product classification colors per theme; HJM picks and checks the label ink.
const seriesColor = { light: '#216BA8', dark: '#216BA8' } as const;
const gradeColor = { light: '#F2C94C', dark: '#F2C94C' } as const;
export const CategoryColor: Story = { name: '제품 분류 색', render: () => <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
  <Badge categoryColor={seriesColor}>정규시즌</Badge>
  <Badge categoryColor={gradeColor}>A등급</Badge>
  <Badge categoryColor={{ light: '#1762A0', dark: '#7FB8F0' }} variant="outline">포스트시즌</Badge>
</div> };
