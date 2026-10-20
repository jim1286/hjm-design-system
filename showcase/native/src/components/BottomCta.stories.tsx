import type { ComponentRef } from "react";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { Play } from "lucide-react-native";
import { useRef, useState } from "react";
import type { View } from "react-native";
import { BottomCTA, Dialog, Text } from "@hjmds/react-native";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/동작/하단 실행 버튼", component: NativeComponentPreview, args: { componentId: "bottom-cta", variant: "default" }, parameters: { hjm: { componentIds: ["bottom-cta"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};

function FocusReturnPreview() {
  const { colors } = useHjmNativeTheme();
  const [open, setOpen] = useState(false);
  // Native overlays return focus only to an explicit target, so the footer action hands out its button.
  const start = useRef<ComponentRef<typeof View>>(null);
  return <>
    <Text tone="muted">시작을 눌러 연 창을 닫으면 포커스가 시작 버튼으로 돌아와요.</Text>
    <BottomCTA primaryAction={{ label: "전광판 시작", leading: <Play accessible={false} size={16} color={colors.onPrimary} />, onPress: () => setOpen(true), buttonRef: start }} />
    <Dialog open={open} onOpenChange={setOpen} title="전광판" closeLabel="전광판 닫기" returnFocusRef={start}>
      <Text>오늘도 좋은 하루</Text>
    </Dialog>
  </>;
}
export const FocusReturn: Story = { name: "닫은 뒤 포커스 복귀", render: () => <FocusReturnPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
