import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/상태와 알림/로딩 표시", component: NativeComponentPreview, args: { componentId: "spinner", variant: "default" }, parameters: { hjm: { componentIds: ["spinner"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

import { useState } from "react";
import { View } from "react-native";
import { TextField } from "@hjmds/react-native/inputs";
import { PendingContent } from "@hjmds/react-native/feedback";
import { Button } from "@hjmds/react-native/actions";
function PendingRegionExample() {
  const [pending, setPending] = useState(false);
  return <View><Button onPress={() => setPending(!pending)}>{pending ? "대기 취소" : "대기 시작"}</Button>
    <PendingContent pending={pending} label="연결 중"><TextField label="보존할 초안" defaultValue="작성 중인 내용" /></PendingContent></View>;
}
export const PendingRegion: Story = { name: "입력을 보존하는 대기 영역", render: () => <PendingRegionExample /> };
