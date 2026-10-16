import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Button } from '@hjmds/react-native/actions';
import { PreviewTools, PreviewToolButton } from './preview-tools';
import { Dialog } from '@hjmds/react-native/overlays';
import { TextField } from '@hjmds/react-native/inputs';
import { Stack, Text } from '@hjmds/react-native/primitives';
import { PatternStatus } from './pattern-status';
import type { TransitionRect } from '@hjmds/design-contracts/content-transition';
export function OriginDialogPreview() {
 const trigger = useRef<View>(null);
 const [origin, setOrigin] = useState<TransitionRect>();
 const [open, setOpen] = useState(false);
 const [draft, setDraft] = useState('다음 여행에서 하고 싶은 일');
 const [saved, setSaved] = useState<string | null>(null);
 const [failNext, setFailNext] = useState(false);
 const [error, setError] = useState(false);
 const measurement = useRef(0);
 useEffect(() => () => { measurement.current++; }, []);
 const changeOpen = (next: boolean) => { if (!next) measurement.current++; setOpen(next); };
 function show() {
  const request = ++measurement.current;
  if (!trigger.current?.measureInWindow) { setOrigin(undefined); setOpen(true); return; }
  // Native measurement is asynchronous: a newer opener or closing/unmounting
  // invalidates old coordinates and must never reopen a completed editor.
  trigger.current.measureInWindow((x, y, width, height) => { if (request !== measurement.current) return; setOrigin({ x, y, width, height }); setOpen(true); });
 }
 return <Stack gap="lg"><Text>버튼에서 편집 화면으로 이어집니다. 닫았다 열어도 작성 중인 내용을 유지해요.</Text>
  <Button ref={trigger} onPress={show}>메모 편집</Button><PreviewTools><PreviewToolButton selected={failNext} onPress={() => setFailNext(value => !value)}>{failNext ? "저장 실패 예약됨" : "저장 실패 체험"}</PreviewToolButton></PreviewTools><PatternStatus>{saved === null ? '아직 저장하지 않았어요.' : saved.trim() ? `저장한 메모: ${saved}` : '빈 메모를 저장했어요.'}</PatternStatus>
  <Dialog open={open} onOpenChange={changeOpen} title="여행 메모" closeLabel="편집 닫기" returnFocusRef={trigger}
   {...(origin ? { motionOrigin: origin } : {})} onActionError={() => setError(true)} primaryAction={{ label: '저장', onPress: () => { setError(false); if (failNext) { setFailNext(false); throw new Error('simulated save failure'); } setSaved(draft); } }}>
   {error ? <PatternStatus announceOnMount tone="danger">저장하지 못했어요. 입력은 유지되어 있어요. 다시 저장해 주세요.</PatternStatus> : null}
   <TextField label="메모" value={draft} onValueChange={setDraft}/>
  </Dialog>
 </Stack>;
}
