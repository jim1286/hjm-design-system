import { Icon } from "@hjmds/react/display";
import { ReactionPicker } from "@hjmds/react/reaction-picker";
import { NotificationBell } from "@hjmds/react/notification-bell";
import { useRef, useState } from "react";
import { DurationField } from "@hjmds/react/duration-field";
import { InlineConfirm } from "@hjmds/react/inline-confirm";
import { Stack, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
import { Button } from "@hjmds/react/actions";
import { Switch } from "@hjmds/react/selection";
import { durationLabels, socialCopy, reactionOptions, runConfirmationPreview, compoundCopy as copy } from "../../../shared/compound-controls";
export function Duration() {
  const [value, setValue] = useState(1500);
  return <Stack gap="xl"><Heading level="level2">{copy.durationTitle}</Heading><Text tone="muted">{copy.durationDescription}</Text><DurationField value={value} onValueChange={setValue} max={86399} labels={durationLabels}/><Text>{copy.total(value)}</Text></Stack>;
}
export function Confirm() {
  const [key, setKey] = useState(0);
  const [fail, setFail] = useState(false);
  const failRef=useRef(fail);failRef.current=fail;
  return <Stack gap="xl"><Heading level="level2">{copy.confirmTitle}</Heading><Text tone="muted">{copy.confirmDescription}</Text>
    <Switch label={copy.fail} checked={fail} onCheckedChange={setFail}/>
    <InlineConfirm key={key} {...copy.confirm} onConfirm={() => runConfirmationPreview(() => failRef.current)}/>
    <Text tone="muted">{copy.saved}</Text><Button tone="ghost" onClick={()=>setKey(key+1)}>{copy.reset}</Button>
  </Stack>;
}
export function Reactions() { const [value,setValue]=useState<string|null>(null); return <Stack gap="xl"><Heading level="level2">{socialCopy.title}</Heading><ReactionPicker label={socialCopy.group} options={reactionOptions} value={value} onValueChange={setValue}/></Stack>; }
export function Notifications(){const [count,setCount]=useState(3);return <Stack gap="xl"><NotificationBell count={count} label={socialCopy.notifications(count)} icon={<Icon name="notifications"/>} onPress={()=>setCount(0)}/><Text tone="muted">{socialCopy.hint}</Text><Button onClick={()=>setCount(count+1)}>{socialCopy.add}</Button></Stack>;}
