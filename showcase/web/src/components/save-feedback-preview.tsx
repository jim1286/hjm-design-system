import { useState } from "react";
import { Button } from "@hjmds/react/actions";
import { Stack } from "@hjmds/react/layout";
import { Toast } from "@hjmds/react/toast";
import { saveFeedbackExample as example, type SaveFeedbackExampleVariant } from "../../../shared/save-feedback";

export function SaveFeedbackPreview({ variant = "compact" }: { variant?: SaveFeedbackExampleVariant }) {
  const [saved, setSaved] = useState(true);
  return <Stack gap="md">
    {saved ? <Toast descriptor={example[variant]} onDismissRequest={() => setSaved(false)} /> : null}
    <Stack axis="inline" gap="sm">
      <Button tone="secondary" onClick={() => setSaved(false)}>수정</Button>
      <Button onClick={() => setSaved(true)} disabled={saved}>저장</Button>
    </Stack>
  </Stack>;
}
