import { useRef, useState } from 'react';
import { View } from 'react-native';
import { Button } from '@hjmds/react-native/actions';
import { Dialog } from '@hjmds/react-native/overlays';
import { TextField } from '@hjmds/react-native/inputs';
import { Stack, Text } from '@hjmds/react-native/primitives';
import type { TransitionRect } from '@hjmds/design-contracts/content-transition';
export function OriginDialogPreview() {
 const trigger = useRef<View>(null);
 const [origin, setOrigin] = useState<TransitionRect>();
 const [open, setOpen] = useState(false);
 const [draft, setDraft] = useState('다음 여행에서 하고 싶은 일');
 const [saved, setSaved] = useState('');
 const [failNext, setFailNext] = useState(false);
 const [error, setError] = useState(false);
 function show() {
  if (!trigger.current?.measureInWindow) { setOrigin(undefined); setOpen(true); return; }
  trigger.current.measureInWindow((x, y, width, height) => { setOrigin({ x, y, width, height }); setOpen(true); });
 }
 return <Stack gap="lg"><Text>버튼에서 편집 화면으로 이어집니다. 닫았다 열어도 작성 중인 내용을 유지해요.</Text>
  <Button ref={trigger} onPress={show}>메모 편집</Button><Button tone="ghost" selected={failNext} onPress={() => setFailNext(value => !value)}>{failNext ? "저장 실패 예약됨" : "저장 실패 체험"}</Button><Text accessibilityLiveRegion="polite">{saved || '아직 저장하지 않았어요.'}</Text>
  <Dialog open={open} onOpenChange={setOpen} title="여행 메모" closeLabel="편집 닫기" returnFocusRef={trigger}
   {...(origin ? { motionOrigin: origin } : {})} onActionError={() => setError(true)} primaryAction={{ label: '저장', onPress: () => { setError(false); if (failNext) { setFailNext(false); throw new Error('simulated save failure'); } setSaved(draft); } }}>
   {error ? <Text accessibilityRole="alert">저장하지 못했어요. 입력은 유지되어 있어요. 다시 저장해 주세요.</Text> : null}
   <TextField label="메모" value={draft} onValueChange={setDraft}/>
  </Dialog>
 </Stack>;
}
