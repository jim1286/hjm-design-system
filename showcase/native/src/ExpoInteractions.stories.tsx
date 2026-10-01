import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { Button } from "@hjmds/react-native/actions";
import { Text } from "@hjmds/react-native/primitives";
import { ContentTransition } from "@hjmds/react-native/content-transition";

// Preview copy stays keyed, like product i18n input; no app's identity or service
// is embedded in this reusable interruption example.
const copy = {
  title: "중단해도 남는 현재 상태", next: "다음 상태", cancel: "처음으로",
  hide: "콘텐츠 닫기", show: "다시 열기", motion: "동작 줄이기",
  description: "빠르게 누르거나 전환 도중 닫아 보세요. 현재 내용은 완료 콜백을 기다리지 않습니다.",
  states: ["준비", "검토", "완료"],
} as const;
function ExpoInteractionPreview() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  return <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
    <Text variant="title">{copy.title}</Text><Text>{copy.description}</Text>
    <Button selected={reduced} onPress={() => setReduced(value => !value)}>{copy.motion}</Button>
    <View style={{ gap: spacing.sm }}>
      <Button onPress={() => setIndex(value => (value + 1) % copy.states.length)}>{copy.next}</Button>
      <Button tone="secondary" onPress={() => setIndex(0)}>{copy.cancel}</Button>
      <Button tone="ghost" onPress={() => setVisible(value => !value)}>{visible ? copy.hide : copy.show}</Button>
    </View>
    {visible ? <ContentTransition stateKey={String(index)} preset="rise" motion={reduced ? "none" : "system"}>
      <Text accessibilityLiveRegion="polite">{copy.states[index]}</Text>
    </ContentTransition> : null}
  </ScrollView>;
}
const meta = { title: "배포/구성/Expo 인터랙션 복구", component: ExpoInteractionPreview } satisfies Meta<typeof ExpoInteractionPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
