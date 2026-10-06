import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationItemPreview } from "./conversation-previews";
const meta = { id: "common-screen-notification-item", title: "배포/구성/정보 표시/알림 항목", component: NotificationItemPreview } satisfies Meta<typeof NotificationItemPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
