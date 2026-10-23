import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual Divider item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-layout--divider keeps the same preview for old links.
const meta = { id: "components-layout-divider", title: "배포/컴포넌트/레이아웃/구분선", component: ContractStory, args: { name: "Divider" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

import { Divider } from '@hjmds/react/display';
// lineStyle="dashed" (2026-10-23): a break inside one surface; dash/gap from dividerRecipe.lineStyles (Diairy nest card).
export const Dashed: Story = { name: '점선', render: () => <div style={{ display: 'grid', gap: 16, maxWidth: 360 }}>
  <p style={{ margin: 0 }}>오늘 받은 편지</p><Divider lineStyle="dashed" /><p style={{ margin: 0 }}>이어지는 이야기</p>
</div> };
