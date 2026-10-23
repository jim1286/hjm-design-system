import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AlertDialogQueueProvider, useAlertDialogQueue } from "@hjmds/react/alert-dialog-queue";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import { ContractStory } from "./preview-registry";
import { alertDialogQueueExample as copy } from "../../../shared/alert-dialog-queue";

// Two questions asked at once wait their turn; each awaited result comes back in order.
function QueueAsker() {
  const { open } = useAlertDialogQueue();
  const [answers, setAnswers] = useState<string[]>([]);
  const ask = async () => {
    const [first, second] = await Promise.all([open(copy.first), open(copy.second)]);
    setAnswers([first, second].map((result) => copy.results[result.outcome]));
  };
  return <Stack gap="sm"><Button onClick={() => void ask()}>{copy.trigger}</Button><Text tone="muted">{answers.length ? answers.join(" · ") : copy.idle}</Text></Stack>;
}
function QueuePreview() { return <AlertDialogQueueProvider scope="story"><QueueAsker /></AlertDialogQueueProvider>; }

// Individual AlertDialog item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-overlays--alert-dialog keeps the same preview for old links.
const meta = { id: "components-overlays-alert-dialog", title: "배포/컴포넌트/오버레이/확인 대화상자", component: ContractStory, args: { name: "AlertDialog" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Queue: Story = { name: "대기열과 결과", render: () => <QueuePreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
