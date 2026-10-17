import { useRef, useState } from 'react';
import { Button } from '@hjmds/react/actions';
import { PreviewTools, PreviewToolButton } from './preview-tools';
import { Popover } from '@hjmds/react/popover';
import { Dialog } from '@hjmds/react/overlays';
import { TextField } from '@hjmds/react/forms';
import { Stack, Text } from '@hjmds/react/layout';
import type { TransitionRect } from '@hjmds/design-contracts/content-transition';
export function OriginDialogPreview() {
 const trigger = useRef<HTMLButtonElement>(null);
 const [origin, setOrigin] = useState<TransitionRect>();
 const [open, setOpen] = useState(false);
 const [draft, setDraft] = useState('다음 여행에서 하고 싶은 일');
 const [saved, setSaved] = useState<string | null>(null);
 const [failNext, setFailNext] = useState(false);
 const [error, setError] = useState(false);
 return <Stack gap="lg">
  <Button ref={trigger} onClick={() => { setOrigin(trigger.current?.getBoundingClientRect()); setOpen(true); }}>메모 편집</Button>
  <Text role="status">{saved === null ? '아직 저장하지 않았어요.' : saved.trim() ? `저장한 메모: ${saved}` : '빈 메모를 저장했어요.'}</Text>
  <Dialog open={open} onOpenChange={setOpen} title="여행 메모" closeLabel="편집 닫기" returnFocusRef={trigger}
   {...(origin ? { motionOrigin: origin } : {})} footer={<Button onClick={() => { setError(false); if (failNext) { setFailNext(false); setError(true); return; } setSaved(draft); setOpen(false); }}>저장</Button>}>
   {error ? <Text role="alert">저장하지 못했어요. 입력은 유지되어 있어요. 다시 저장해 주세요.</Text> : null}
   <TextField label="메모" value={draft} onValueChange={setDraft}/>
  </Dialog>
  <PreviewTools><PreviewToolButton selected={failNext} onClick={() => setFailNext(value => !value)}>다음 저장 실패시키기</PreviewToolButton></PreviewTools>
 </Stack>;
}

// Keep the draft above the conditional portal: closing a contextual editor must
// not silently discard input, as observed in the reference Add Note example.
export function OriginPopoverPreview() {
 const trigger = useRef<HTMLButtonElement>(null);
 const [origin, setOrigin] = useState<TransitionRect>();
 const [draft, setDraft] = useState('다음 여행에서 하고 싶은 일');
 const [saved, setSaved] = useState<string | null>(null);
 const [failNext, setFailNext] = useState(false);
 const [error, setError] = useState(false);
 return <Stack gap="lg">
  <Popover title="여행 메모" closeLabel="편집 닫기" {...(origin ? { motionOrigin: origin } : {})}
   trigger={<Button ref={trigger} onClick={() => setOrigin(trigger.current?.getBoundingClientRect())}>메모 편집</Button>}>
   {({ close }) => <Stack gap="md">
    {error ? <Text role="alert">저장하지 못했어요. 입력은 유지되어 있어요. 다시 저장해 주세요.</Text> : null}
    <TextField label="메모" value={draft} onValueChange={setDraft}/>
    <Button onClick={() => { setError(false); if (failNext) { setFailNext(false); setError(true); return; } setSaved(draft); close(); }}>저장</Button>
   </Stack>}
  </Popover>
  <Text role="status">{saved === null ? '아직 저장하지 않았어요.' : saved.trim() ? `저장한 메모: ${saved}` : '빈 메모를 저장했어요.'}</Text>
  <PreviewTools><PreviewToolButton selected={failNext} onClick={() => setFailNext(value => !value)}>다음 저장 실패시키기</PreviewToolButton></PreviewTools>
 </Stack>;
}
