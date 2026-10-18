import { useState } from "react";
import { Text as NativeText } from "react-native";
import { Button, Stack, Text, useHjmTextFace } from "@hjmds/react-native";
import { StatusText } from "@hjmds/react-native/status-text";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/글자와 아이콘/본문 글자", component: NativeComponentPreview, args: { componentId: "text", variant: "default" }, parameters: { hjm: { componentIds: ["text"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};

function StatusPreview() {
  const [count, setCount] = useState(0);
  const [failed, setFailed] = useState(false);
  return <Stack gap="sm">
    <StatusText announcement={failed ? "assertive" : "polite"} tone={failed ? "danger" : "muted"}>
      {failed ? "저장하지 못했어요. 다시 시도해 주세요." : count ? `${count}번째 저장을 완료했어요.` : "변경한 내용은 저장 버튼으로 반영해요."}
    </StatusText>
    <Stack axis="inline" gap="xs">
      <Button onPress={() => { setCount(value => value + 1); setFailed(false); }}>저장</Button>
      <Button tone="secondary" onPress={() => setFailed(true)}>실패 보기</Button>
    </Stack>
  </Stack>;
}
export const Status: Story = { name: "상태 알림", render: () => <StatusPreview /> };

function ScorePreview() {
  const [score, setScore] = useState(7);
  // Above the HJM type scale the product draws its own figure; useHjmTextFace keeps the Provider's face on it.
  const figureFace = useHjmTextFace({ weight: "800" });
  return <Stack gap="sm">
    <Stack axis="inline" gap="md" align="center">
      <Text variant="heading" emphasis="strong" color="#c8102e" numeric="tabular">{score}</Text>
      <Text variant="heading" emphasis="strong" tone="muted" numeric="tabular">11</Text>
    </Stack>
    <NativeText style={{ ...figureFace, fontSize: 40, lineHeight: 46, color: "#c8102e", fontVariant: ["tabular-nums"] }}>.{340 + score}</NativeText>
    <Button tone="secondary" onPress={() => setScore(value => (value + 1) % 20)}>점수 올리기</Button>
  </Stack>;
}
export const ProductColor: Story = { name: "제품 색과 고정 폭 숫자", render: () => <ScorePreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
