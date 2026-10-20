import { useState } from "react";
import { SheetPanel } from "@hjmds/react-native/sheet-panel";
import { View } from "react-native";
import { Sheet } from "@hjmds/react-native/overlays";
import { Button } from "@hjmds/react-native/actions";
import { Text } from "@hjmds/react-native/primitives";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/오버레이/시트", component: NativeComponentPreview, args: { componentId: "sheet", variant: "default" }, parameters: { hjm: { componentIds: ["sheet"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

function ReadingPanelExample() {
  const [open, setOpen] = useState(false);
  return <>
    <Button onPress={() => setOpen(true)}>편지 읽기</Button>
    <Sheet open={open} onOpenChange={setOpen} placement="end" swipeDirection="down" showClose={false} title="편지" closeLabel="편지 닫기" scrollable>
      <Text>본문은 스크롤하고, 위 손잡이를 아래로 끌거나 눌러 닫으세요.</Text>
    </Sheet>
  </>;
}
export const ReadingPanel: Story = { name: "아래로 닫는 옆 읽기 패널 · 미게시", render: () => <ReadingPanelExample /> };


export const PersistentPanel: Story = { name: "지도와 함께 쓰는 하단 패널 · 미게시", render: () => <View style={{ height: 420, justifyContent: "flex-end" }}>
  <Text>뒤의 지도 영역은 계속 조작할 수 있습니다.</Text>
  <SheetPanel handleLabel="여정 패널" maximumHeight={260} height={260}>
    <Text>손잡이를 누르거나 아래로 끌어 접으세요. 위로 끌면 다시 펼쳐집니다.</Text>
    <Button onPress={() => {}}>편지 열기</Button>
  </SheetPanel>
</View> };
