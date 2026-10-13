import { useState } from "react";
import { Button, Stack } from "@hjmds/react-native";
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
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
