import { useRef, useState } from 'react';
import { Button } from '@hjmds/react/actions';
import { Dialog } from '@hjmds/react/overlays';
import { TextField } from '@hjmds/react/forms';
import { Stack, Text } from '@hjmds/react/layout';
import type { TransitionRect } from '@hjmds/design-contracts/content-transition';
export function OriginDialogPreview() {
 const trigger = useRef<HTMLButtonElement>(null);
 const [origin, setOrigin] = useState<TransitionRect>();
 const [open, setOpen] = useState(false);
 const [draft, setDraft] = useState('다음 여행에서 하고 싶은 일');
 const [saved, setSaved] = useState('');
 const [failNext, setFailNext] = useState(false);
 const [error, setError] = useState(false);
 return <Stack gap="lg"><Text>버튼에서 편집 화면으로 이어집니다. 닫았다 열어도 작성 중인 내용을 유지해요.</Text>
  <Button ref={trigger} onClick={() => { setOrigin(trigger.current?.getBoundingClientRect()); setOpen(true); }}>메모 편집</Button>
  <Button tone="ghost" selected={failNext} onClick={() => setFailNext(value => !value)}>{failNext ? "저장 실패 예약됨" : "저장 실패 체험"}</Button>
  <Text role="status">{saved || '아직 저장하지 않았어요.'}</Text>
  <Dialog open={open} onOpenChange={setOpen} title="여행 메모" closeLabel="편집 닫기" returnFocusRef={trigger}
   {...(origin ? { motionOrigin: origin } : {})} footer={<Button onClick={() => { setError(false); if (failNext) { setFailNext(false); setError(true); return; } setSaved(draft); setOpen(false); }}>저장</Button>}>
   {error ? <Text role="alert">저장하지 못했어요. 입력은 유지되어 있어요. 다시 저장해 주세요.</Text> : null}
   <TextField label="메모" value={draft} onValueChange={setDraft}/>
  </Dialog>
 </Stack>;
}
