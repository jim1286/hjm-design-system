import type { Meta, StoryObj } from "@storybook/react-native";
import { useRef, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ToastRegion, useToastRegion } from "@hjmds/react-native/feedback";
import { createLiquidToastPresentation } from "@hjmds/react-native/toast-liquid";
import { Button } from "@hjmds/react-native/actions";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { HjmNativeProvider } from "@hjmds/react-native/provider";

const liquid = createLiquidToastPresentation();
function Controls({ longCopy }: { longCopy: boolean }) {
  const toast = useToastRegion();
  const count = useRef(0);
  const [opened, setOpened] = useState("");
  const publish = () => {
    const id = `generation:${++count.current}`;
    toast.publish({ id, presentation: "liquid", tone: "success", title: "아이디어가 완성됐어요",
      description: longCopy ? "기다리던 결과가 준비됐어요. 다른 화면을 보고 있어도 여기에서 결과를 열 수 있어요. Your new idea is ready to explore." : `결과 ${count.current}를 확인해 보세요.`,
      closeLabel: "완료 알림 닫기", action: { label: "결과 열기", onAction: () => setOpened(id) } });
  };
  return <Stack gap="md">
    <Text variant="title">Liquid Toast</Text><Text>완료된 결과를 알리는 선택형 표현</Text>
    <Button onPress={publish}>생성 완료 알림</Button>
    <Button tone="ghost" onPress={() => { publish(); publish(); publish(); }}>알림 3개 연속 보내기</Button>
    <Text>{opened ? `${opened} 결과를 열었어요` : "상단 알림을 위로 밀거나 닫아 보세요."}</Text>
  </Stack>;
}
function Example({ longCopy = false, reduced = false }: { longCopy?: boolean; reduced?: boolean }) {
  const insets = useSafeAreaInsets();
  const content = <ToastRegion placement="top" presentationAdapter={liquid} safeAreaInsets={insets}>
      {/* Leave the upper viewport available for the source capsule and measured card in this gallery. */}
      <View style={{ paddingTop: 280, flex: 1 }}><Controls longCopy={longCopy} /></View>
    </ToastRegion>;
  return reduced ? <HjmNativeProvider reducedMotion>{content}</HjmNativeProvider> : content;
}
const meta = { title: "Patterns/Liquid Toast", component: Example } satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Capsule: Story = {};
export const LongCopy: Story = { args: { longCopy: true } };
export const ReducedMotion: Story = { args: { reduced: true } };
