import type { Meta, StoryObj } from "@storybook/react-native";
import { useEffect, useState } from "react";
import { ScreenHost, ScreenLayout } from "@hjmds/react-native/screens";
import { Text } from "@hjmds/react-native/primitives";
import { ScreenLayoutPreview } from "./common-screen-previews";
const meta = { title: "배포/화면/화면 틀과 도구/화면 골격과 상태", component: ScreenLayoutPreview } satisfies Meta<typeof ScreenLayoutPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Loading: Story = { name: "불러오는 중", args: { stateKind: "loading" } };
export const Empty: Story = { name: "비어 있음", args: { stateKind: "empty" } };
export const Error: Story = { name: "오류", args: { stateKind: "error" } };
export const Restricted: Story = { name: "로그인 필요", args: { stateKind: "restricted" } };
// The route host owns the window top/side insets and the canvas behind them (HjmNativeProvider safeAreaInsets).
export const Hosted: Story = { name: "바깥 host와 안전 영역", render: (args) => <ScreenHost><ScreenLayoutPreview {...args} /></ScreenHost> };
// The screen owns pull to refresh; the in-memory delay stands in for the product's request.
function RefreshPreview() {
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => { if (!refreshing) return; const timer = setTimeout(() => setRefreshing(false), 1200); return () => clearTimeout(timer); }, [refreshing]);
  return <ScreenLayout title="알림" onRefresh={() => setRefreshing(true)} refreshing={refreshing} refreshLabel="새 알림을 불러오는 중"><Text tone="muted">아래로 당겨 새로고침해요.</Text></ScreenLayout>;
}
export const Refresh: Story = { name: "당겨서 새로고침", render: () => <RefreshPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
// 2026-10-06: 실패와 초안 복구 had no send action on this screen and was removed.
