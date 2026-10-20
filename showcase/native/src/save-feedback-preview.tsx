import { useState } from "react";
import { Check } from "lucide-react-native";
import { Button } from "@hjmds/react-native/actions";
import { Card } from "@hjmds/react-native/data-display";
import { Notice, Toast } from "@hjmds/react-native/feedback";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { CompositionLayout } from "@hjmds/react-native/screens";
import { saveFeedbackExample as example, type SaveFeedbackExampleVariant } from "../../shared/save-feedback";

export function SaveFeedbackPreview({ variant = "compact" }: { variant?: SaveFeedbackExampleVariant }) {
  const [saved, setSaved] = useState(true);
  return <Stack gap="md">
    {variant === "inline" ? <Card>
      <CompositionLayout title={example.subject} description={example.detail}
        badge={saved ? <Notice appearance="status" tone="success" announcement="polite" title={example.saved} /> : undefined}
        footer={saved ? <Text tone="muted">{example.result}</Text> : undefined} />
    </Card> : saved ? <Toast descriptor={example[variant]} onDismiss={() => setSaved(false)}
      renderToneIcon={({ color, size }) => <Check color={color} size={size} accessible={false} />} /> : null}
    <Stack axis="inline" gap="sm">
      <Button tone="secondary" onPress={() => setSaved(false)}>수정</Button>
      <Button onPress={() => setSaved(true)} disabled={saved}>저장</Button>
    </Stack>
  </Stack>;
}
