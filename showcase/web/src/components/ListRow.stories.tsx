import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual ListRow item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-data-display--list-row keeps the same preview for old links.
const meta = { id: "components-data-display-list-row", title: "배포/컴포넌트/데이터 표시/목록 행", component: ContractStory, args: { name: "ListRow" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

import { ListRow } from '@hjmds/react/display';
// trailingAccessory="disclosure" (2026-10-23): HJM draws the chevron products used to put into `trailing`.
export const Disclosure: Story = { name: '이동 표시', render: () => <div style={{ display: 'grid', paddingInline: 16 }}>
  <ListRow title="알림 설정" href="#notifications" trailingAccessory="disclosure" />
  <ListRow title="앱 버전" description="최신 버전을 사용 중입니다" href="#version" trailing="1.2.0" trailingAccessory="disclosure" />
</div> };
