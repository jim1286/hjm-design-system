import { View } from "react-native";
import { NotificationItem } from "@hjmds/react-native/screens";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/데이터 표시/알림 목록 항목", component: NativeComponentPreview, args: { componentId: "notification-item", variant: "default" }, parameters: { hjm: { componentIds: ["notification-item"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
// unreadLabel (2026-10-23): HJM draws the named unread dot after the status·time line.
export const Unread: Story = { name: "안 읽음 점 · 미게시", render: () => <View>
  <NotificationItem read={false} unreadLabel="읽지 않음" statusLabel="댓글" timestamp="3분 전" title="민지님이 댓글을 남겼어요" description="좋은 사진이에요" onPress={() => {}} />
  <NotificationItem read unreadLabel="읽지 않음" statusLabel="좋아요" timestamp="어제" title="하늘님이 좋아해요" onPress={() => {}} />
</View> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
