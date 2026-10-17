import { Heading } from "@hjmds/react-native/heading";
import { Bell } from "lucide-react-native";
import { createLucideGlyph } from "@hjmds/react-native/icon-lucide";
import { Icon } from "@hjmds/react-native/primitives";
import { ReactionPicker } from "@hjmds/react-native/reaction-picker";
import { NotificationBell } from "@hjmds/react-native/notification-bell";
import { useRef, useState, type ReactNode } from "react";
import { ScrollView } from "react-native";
import { DurationField } from "@hjmds/react-native/duration-field";
import { InlineConfirm } from "@hjmds/react-native/inline-confirm";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { Switch } from "@hjmds/react-native/inputs";
import { spacing } from "@hjmds/design-contracts/foundations";
import { PreviewTools, PreviewToolButton } from "./preview-tools";
import { durationLabels, socialCopy, reactionOptions, runConfirmationPreview, compoundCopy as copy } from "../../shared/compound-controls";
// The Storybook canvas already supplies the 16pt gutter; an extra content padding pushed these stories 40pt in
// while every other component story starts at 16 (2026-10-17 review). Only the section gap stays.
function PreviewScroll({ children }: { children: ReactNode }) {
  return <ScrollView contentContainerStyle={{ gap: spacing.xl, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">{children}</ScrollView>;
}
export function Duration() {
  const [value,setValue]=useState(1500);
  return <PreviewScroll><Heading level="level3">{copy.durationTitle}</Heading><Text tone="muted">{copy.durationDescription}</Text><DurationField value={value} onValueChange={setValue} max={86399} labels={durationLabels}/><Text>{copy.total(value)}</Text></PreviewScroll>;
}
export function Confirm() {
  const [key,setKey]=useState(0);const [fail,setFail]=useState(false);const failRef=useRef(fail);failRef.current=fail;
  return <PreviewScroll><Heading level="level3">{copy.confirmTitle}</Heading><Text tone="muted">{copy.confirmDescription}</Text>
    <Stack align="start"><InlineConfirm key={key} {...copy.confirm} onConfirm={() => runConfirmationPreview(() => failRef.current)}/></Stack>
    <PreviewTools><Switch presentation="inline" label={copy.fail} checked={fail} onCheckedChange={setFail}/><PreviewToolButton onPress={()=>setKey(current=>current+1)}>{copy.reset}</PreviewToolButton></PreviewTools>
    <Text tone="muted" variant="caption">{copy.saved}</Text></PreviewScroll>;
}
const bellGlyph=createLucideGlyph({notifications:Bell});
export function Reactions(){const [value,setValue]=useState<string|null>(null);return <PreviewScroll><Heading level="level3">{socialCopy.title}</Heading><ReactionPicker label={socialCopy.group} options={reactionOptions} value={value} onValueChange={setValue}/></PreviewScroll>;}
export function Notifications(){const [count,setCount]=useState(3);return <PreviewScroll><NotificationBell count={count} label={socialCopy.notifications(count)} icon={<Icon descriptor={{name:'notifications'}} renderGlyph={bellGlyph}/>} onPress={()=>setCount(0)}/><Text tone="muted">{socialCopy.hint}</Text><PreviewTools><PreviewToolButton onPress={()=>setCount(current=>current+1)}>{socialCopy.add}</PreviewToolButton></PreviewTools></PreviewScroll>;}
