import { IconButtonLink } from "@hjmds/react/actions";
import { Icon } from "@hjmds/react/display";
import { Stack } from "@hjmds/react/layout";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { IconButtonStatePreview } from "./component-state-previews";

// Individual IconButton item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-actions--icon-button keeps the same preview for old links.
const meta = { id: "components-actions-icon-button", title: "배포/컴포넌트/동작/아이콘 버튼", component: ContractStory, args: { name: "IconButton" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Pending: Story = { name: "처리 중", render: () => <IconButtonStatePreview state="pending" /> };
export const Disabled: Story = { name: "비활성", render: () => <IconButtonStatePreview state="disabled" /> };
// IconButtonLink (2026-10-23): a 44 icon-only destination with the IconButton frame; `current` paints the page you are on.
export const Navigation: Story = { name: "이동 링크 · 미게시", render: () => <Stack axis="inline" gap="xs">
  <IconButtonLink href="#icon-link-settings" label="설정" shape="circle" current><Icon name="settings" decorative /></IconButtonLink>
  <IconButtonLink href="#icon-link-profile" label="프로필" shape="circle"><Icon name="user" decorative /></IconButtonLink>
  <IconButtonLink href="#icon-link-billing" label="결제" shape="circle" disabled><Icon name="settings" decorative /></IconButtonLink>
</Stack> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
