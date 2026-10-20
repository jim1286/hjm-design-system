import { useState } from "react";
import { ScreenLayout } from "@hjmds/react-native/screens";
import { Button } from "@hjmds/react-native/actions";
import { Text } from "@hjmds/react-native/primitives";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/레이아웃/화면 골격", component: NativeComponentPreview, args: { componentId: "screen-layout", variant: "default" }, parameters: { hjm: { componentIds: ["screen-layout"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

function PullToDismissExample() {
  const [open, setOpen] = useState(true);
  return open ? <ScreenLayout title="읽기 화면" pullToDismiss exit={{ kind: "close", label: "읽기 화면 닫기", onPress: () => setOpen(false) }}>
    <Text>손잡이를 아래로 끌거나 본문 맨 위에서 새로 당겨 닫으세요.</Text>
  </ScreenLayout> : <Button onPress={() => setOpen(true)}>다시 열기</Button>;
}
export const PullToDismiss: Story = { name: "읽기 화면 당겨 닫기 · 미게시", render: () => <PullToDismissExample /> };
