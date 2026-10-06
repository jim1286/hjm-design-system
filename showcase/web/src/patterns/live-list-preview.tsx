import { useRef, useState } from 'react';
import { Button } from '@hjmds/react/actions';
import { Stack, Text } from '@hjmds/react/layout';
import { List, ListRow } from '@hjmds/react/display';
import { TextField } from '@hjmds/react/forms';
import { ContentTransition } from '@hjmds/react/content-transition';
import { initialLiveList, updateLiveList } from '../../../shared/live-list';
export function LiveListPreview() {
 // The final delete disables its own button; move focus to the recovery action first.
 const addButton = useRef<HTMLButtonElement>(null);
 const { items, paused, setPaused, message, add, remove, reverse, edit } = useLiveList();
 return <Stack gap="lg"><Text>메모를 입력한 뒤 기록을 추가하거나 순서를 바꿔 보세요. 기존 입력은 그대로 남아요.</Text>
  <Stack axis="inline" wrap><Button ref={addButton} onClick={() => add(1)}>기록 추가</Button><Button tone="secondary" onClick={() => add(3)}>3개 함께 추가</Button></Stack>
  <Stack axis="inline" wrap><Button tone="secondary" disabled={items.length < 2} onClick={reverse}>순서 뒤집기</Button><Button tone="secondary" disabled={items.length === 0} onClick={() => { if (items.length === 1) addButton.current?.focus(); remove(); }}>첫 기록 삭제</Button></Stack>
  <Button tone="ghost" selected={paused} onClick={() => setPaused(value => !value)}>{paused ? '움직임 다시 켜기' : '움직임 멈추기'}</Button>
  <Text role="status">{message}</Text>
  <ContentTransition stateKey="live-list" animateHeight motion={paused ? 'none' : 'system'}>
   {items.length ? <List label="편집 중인 기록" separator="full">{items.map(item =>
    <ContentTransition key={item.id} stateKey={item.id} enterOnMount={item.arrived} preset="rise" motion={paused ? 'none' : 'system'}>
     <ListRow title={item.title} description="내용은 이 기록에 저장돼요."/>
     <TextField label={`${item.title} 메모`} value={item.note} onValueChange={value => edit(item.id, value)}/>
    </ContentTransition>)}</List> : <Text>기록이 없어요. 새 기록을 추가해 보세요.</Text>}
  </ContentTransition>
 </Stack>;
}

function useLiveList() {
 const [state, setState] = useState(initialLiveList);
 const [paused, setPaused] = useState(false);
 return { ...state, paused, setPaused,
  add: (count: number) => setState(current => updateLiveList(current, { type: 'add', count })),
  remove: () => setState(current => updateLiveList(current, { type: 'remove' })),
  reverse: () => setState(current => updateLiveList(current, { type: 'reverse' })),
  edit: (id: string, note: string) => setState(current => updateLiveList(current, { type: 'edit', id, note })),
 };
}
