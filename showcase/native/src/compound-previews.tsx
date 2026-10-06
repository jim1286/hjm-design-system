import { Heading } from "@hjmds/react-native/heading";
import { Bell } from "lucide-react-native";
import { createLucideGlyph } from "@hjmds/react-native/icon-lucide";
import { Icon } from "@hjmds/react-native/primitives";
import { ReactionPicker } from "@hjmds/react-native/reaction-picker";
import { NotificationBell } from "@hjmds/react-native/notification-bell";
import { useRef, useState } from "react";
import { ScrollView } from "react-native";
import { DurationField } from "@hjmds/react-native/duration-field";
import { InlineConfirm } from "@hjmds/react-native/inline-confirm";
import { Text } from "@hjmds/react-native/primitives";
import { Button } from "@hjmds/react-native/actions";
import { Switch } from "@hjmds/react-native/inputs";
import { spacing } from "@hjmds/design-contracts/foundations";
import { durationLabels, socialCopy, reactionOptions, runConfirmationPreview, compoundCopy as copy } from "../../shared/compound-controls";
export function Duration() {
  const [value,setValue]=useState(1500);
  return <ScrollView contentContainerStyle={{padding:spacing.xl,gap:spacing.xl}}><Heading level="level3">{copy.durationTitle}</Heading><Text tone="muted">{copy.durationDescription}</Text><DurationField value={value} onValueChange={setValue} max={86399} labels={durationLabels}/><Text>{copy.total(value)}</Text></ScrollView>;
}
export function Confirm() {
  const [key,setKey]=useState(0);const [fail,setFail]=useState(false);const failRef=useRef(fail);failRef.current=fail;
  return <ScrollView contentContainerStyle={{padding:spacing.xl,gap:spacing.xl}}><Heading level="level3">{copy.confirmTitle}</Heading><Text tone="muted">{copy.confirmDescription}</Text><Switch label={copy.fail} checked={fail} onCheckedChange={setFail}/><InlineConfirm key={key} {...copy.confirm} onConfirm={() => runConfirmationPreview(() => failRef.current)}/><Text tone="muted">{copy.saved}</Text><Button tone="ghost" onPress={()=>setKey(key+1)}>{copy.reset}</Button></ScrollView>;
}
const bellGlyph=createLucideGlyph({notifications:Bell});
export function Reactions(){const [value,setValue]=useState<string|null>(null);return <ScrollView contentContainerStyle={{padding:spacing.xl,gap:spacing.xl}}><Heading level="level3">{socialCopy.title}</Heading><ReactionPicker label={socialCopy.group} options={reactionOptions} value={value} onValueChange={setValue}/></ScrollView>;}
export function Notifications(){const [count,setCount]=useState(3);return <ScrollView contentContainerStyle={{padding:spacing.xl,gap:spacing.xl}}><NotificationBell count={count} label={socialCopy.notifications(count)} icon={<Icon descriptor={{name:'notifications'}} renderGlyph={bellGlyph}/>} onPress={()=>setCount(0)}/><Text tone="muted">{socialCopy.hint}</Text><Button onPress={()=>setCount(count+1)}>{socialCopy.add}</Button></ScrollView>;}
