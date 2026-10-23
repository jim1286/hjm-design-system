import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual Affix item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-infrastructure--affix keeps the same preview for old links.
const meta = { id: "components-infrastructure-affix", title: "배포/컴포넌트/기반 기능/고정 배치", component: ContractStory, args: { name: "Affix" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

import { Affix } from '@hjmds/react/affix';
import { Card } from '@hjmds/react/display';
// layer/fill (2026-10-23): the pinned tab bar stays above later positioned cards (layer.sticky) on the canvas fill.
export const PinnedOverPositionedContent: Story = { name: '위치 지정 콘텐츠 위 고정', render: () => <div style={{ height: 320, overflowY: 'auto' }}>
  <Affix><div style={{ padding: 8 }}>소개 · 앱 · 디자인</div></Affix>
  <div style={{ display: 'grid', gap: 16, padding: 16 }}>
    {Array.from({ length: 6 }, (_, index) => <div key={index} style={{ position: 'relative' }}><Card title={`카드 ${index + 1}`}>스크롤하면 고정된 탭 아래로 지나갑니다.</Card></div>)}
  </div>
</div> };
