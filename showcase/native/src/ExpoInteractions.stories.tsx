import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { Button } from "@hjmds/react-native/actions";
import { Text, Container, Stack } from "@hjmds/react-native/primitives";
import { ContentTransition } from "@hjmds/react-native/content-transition";

import { Heading } from "@hjmds/react-native/heading";
import { PatternStatus } from "./pattern-status";

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
  return <ScrollView contentContainerStyle={{ paddingVertical: spacing.md }}><Container gutter="compact"><Stack gap="md">
    <Heading level="level5">{copy.title}</Heading><Text>{copy.description}</Text>
    <Button tone="secondary" selected={reduced} onPress={() => setReduced(value => !value)}>{copy.motion}</Button>
    <Stack gap="sm">
      <Button onPress={() => setIndex(value => (value + 1) % copy.states.length)}>{copy.next}</Button>
      <Button tone="secondary" onPress={() => setIndex(0)}>{copy.cancel}</Button>
      <Button tone="ghost" onPress={() => setVisible(value => !value)}>{visible ? copy.hide : copy.show}</Button>
    </Stack>
    {visible ? <ContentTransition stateKey={String(index)} preset="rise" motion={reduced ? "none" : "system"}>
      <PatternStatus>{copy.states[index]!}</PatternStatus>
    </ContentTransition> : null}
  </Stack></Container></ScrollView>;
}
const meta = { title: "배포/구성/피드백과 복구/중단해도 남는 현재 상태", component: ExpoInteractionPreview } satisfies Meta<typeof ExpoInteractionPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
