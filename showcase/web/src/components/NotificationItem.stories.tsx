import { NotificationItem } from "@hjmds/react/screens";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual NotificationItem item (2026-10-17 screen compositions registered, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-data-display--notification-item keeps the same preview for old links.
const meta = { id: "components-data-display-notification-item", title: "배포/컴포넌트/데이터 표시/알림 목록 항목", component: ContractStory, args: { name: "NotificationItem" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
// unreadLabel (2026-10-23): HJM draws the named unread dot after the status·time line.
export const Unread: Story = { name: "안 읽음 점 · 미게시", render: () => <div>
  <NotificationItem read={false} unreadLabel="읽지 않음" statusLabel="댓글" timestamp="3분 전" title="민지님이 댓글을 남겼어요" description="좋은 사진이에요" href="#notification-1" />
  <NotificationItem read unreadLabel="읽지 않음" statusLabel="좋아요" timestamp="어제" title="하늘님이 좋아해요" href="#notification-2" />
</div> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
