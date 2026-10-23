import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { AlertDialogQueueProvider, useAlertDialogQueue } from "@hjmds/react-native/alert-dialog-queue";
import { Button } from "@hjmds/react-native/actions";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { NativeComponentPreview } from "../component-examples";
import { alertDialogQueueExample as copy } from "../../../shared/alert-dialog-queue";

// Two questions asked at once wait their turn; each awaited result comes back in order.
function QueueAsker() {
  const { open } = useAlertDialogQueue();
  const [answers, setAnswers] = useState<string[]>([]);
  const ask = async () => {
    const [first, second] = await Promise.all([open(copy.first), open(copy.second)]);
    setAnswers([first, second].map((result) => copy.results[result.outcome]));
  };
  return <Stack gap="sm"><Button onPress={() => void ask()}>{copy.trigger}</Button><Text tone="muted">{answers.length ? answers.join(" · ") : copy.idle}</Text></Stack>;
}
function QueuePreview() { return <AlertDialogQueueProvider scope="story"><QueueAsker /></AlertDialogQueueProvider>; }
const meta = { title: "배포/컴포넌트/오버레이/확인 대화상자", component: NativeComponentPreview, args: { componentId: "alert-dialog", variant: "default" }, parameters: { hjm: { componentIds: ["alert-dialog"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Queue: Story = { name: "대기열과 결과", render: () => <QueuePreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
