import type { Meta, StoryObj } from "@storybook/react-vite";
import { Notifications } from "./compound-previews";
const meta = { includeStories: ["Default","Dark","LargeText"], id: "components-feedback-notification-bell", title: "배포/컴포넌트/상태와 알림/알림 벨", component: Notifications, parameters: { hjm: { optionalEntry: "notification-bell" } } } satisfies Meta<typeof Notifications>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
