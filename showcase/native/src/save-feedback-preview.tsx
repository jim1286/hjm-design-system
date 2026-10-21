import { useState } from "react";
import { Check } from "lucide-react-native";
import { Button } from "@hjmds/react-native/actions";
import { Notice, Toast } from "@hjmds/react-native/feedback";
import { Stack } from "@hjmds/react-native/primitives";
import { saveFeedbackExample as example, type SaveFeedbackExampleVariant } from "../../shared/save-feedback";

export function SaveFeedbackPreview({ variant = "compact" }: { variant?: SaveFeedbackExampleVariant }) {
  const [saved, setSaved] = useState(true);
  return <Stack gap="md">
    {saved ? <Toast descriptor={example[variant]} onDismiss={() => setSaved(false)}
      renderToneIcon={({ color, size }) => <Check color={color} size={size} accessible={false} />} /> : null}
    <Stack axis="inline" gap="xs">
      <Button tone="secondary" onPress={() => setSaved(false)}>수정</Button>
      <Button onPress={() => setSaved(true)} disabled={saved}>저장</Button>
    </Stack>
  </Stack>;
}
