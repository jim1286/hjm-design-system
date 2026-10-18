import { useState } from "react";
import { ImageChoiceGroup } from "@hjmds/react/image-choice";
import { Stack, Text } from "@hjmds/react/layout";
import { imageChoiceExample as copy } from "../../../shared/component-examples.js";
import { PreviewPhoto } from "./reference-screen-parts";

export function ImageChoicePreview() {
  const [value, setValue] = useState<string>(copy.initial);
  const chosen = copy.items.find(item => item.id === value)!;
  const [recipients, setRecipients] = useState<string[]>([...copy.recipients.initial]);
  return <Stack gap="sm">
    <ImageChoiceGroup label={copy.label} showLabel selectionMode="single" value={value} onValueChange={setValue}
      items={copy.items.map(item => ({ id: item.id, label: item.label, image: <PreviewPhoto index={item.photo} square label="" /> }))} />
    <Text role="status" tone="muted">{copy.result(chosen.label)}</Text>
    <ImageChoiceGroup label={copy.recipients.label} showLabel showItemLabels selectionMode="multiple" value={recipients} onValueChange={setRecipients}
      items={copy.recipients.items.map(item => ({ id: item.id, label: item.label, image: <PreviewPhoto index={item.photo} square label="" /> }))} />
  </Stack>;
}
