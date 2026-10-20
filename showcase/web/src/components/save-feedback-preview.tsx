import { useState } from "react";
import { Button } from "@hjmds/react/actions";
import { Card } from "@hjmds/react/display";
import { Notice } from "@hjmds/react/feedback";
import { Stack, Text } from "@hjmds/react/layout";
import { CompositionLayout } from "@hjmds/react/screens";
import { Toast } from "@hjmds/react/toast";
import { saveFeedbackExample as example, type SaveFeedbackExampleVariant } from "../../../shared/save-feedback";

export function SaveFeedbackPreview({ variant = "compact" }: { variant?: SaveFeedbackExampleVariant }) {
  const [saved, setSaved] = useState(true);
  return <Stack gap="md">
    {variant === "inline" ? <Card>
      <CompositionLayout title={example.subject} description={example.detail}
        badge={saved ? <Notice appearance="status" tone="success" title={example.saved} /> : undefined}
        footer={saved ? <Text tone="muted">{example.result}</Text> : undefined} />
    </Card> : saved ? <Toast descriptor={example[variant]} onDismissRequest={() => setSaved(false)} /> : null}
    <Stack axis="inline" gap="sm">
      <Button tone="secondary" onClick={() => setSaved(false)}>수정</Button>
      <Button onClick={() => setSaved(true)} disabled={saved}>저장</Button>
    </Stack>
  </Stack>;
}
