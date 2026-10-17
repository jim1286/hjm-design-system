import { useRef, useState } from 'react';
import { Button } from '@hjmds/react/actions';
import { PreviewTools, PreviewToolButton } from './preview-tools';
import { Stack, Text } from '@hjmds/react/layout';
import { List, ListRow } from '@hjmds/react/display';
import { TextField } from '@hjmds/react/forms';
import { EmptyState } from '@hjmds/react/feedback';
import { listRowRecipe } from '@hjmds/design-contracts/recipes';
import { ContentTransition } from '@hjmds/react/content-transition';
import { initialLiveList, updateLiveList } from '../../../shared/live-list';
const rowInset = listRowRecipe.density.comfortable.paddingHorizontal;
export function LiveListPreview() {
 // Safari pointer clicks leave focus in the row. Move it before removal; the
 // final delete disables its own button, so the recovery action takes over.
 const addButton = useRef<HTMLButtonElement>(null);
 const { items, paused, setPaused, message, add, remove, reverse, edit } = useLiveList();
 return <Stack gap="lg"><Text>메모를 입력한 뒤 기록을 추가하거나 순서를 바꿔 보세요. 기존 입력은 그대로 남아요.</Text>
  <Stack axis="inline" gap="sm" wrap><Button ref={addButton} onClick={() => add(1)}>기록 추가</Button><Button tone="secondary" onClick={() => add(3)}>3개 함께 추가</Button>
   <Button tone="secondary" disabled={items.length < 2} onClick={reverse}>순서 뒤집기</Button><Button tone="secondary" disabled={items.length === 0} onClick={event => { (items.length === 1 ? addButton.current : event.currentTarget)?.focus(); remove(); }}>첫 기록 삭제</Button></Stack>
  <PreviewTools><PreviewToolButton selected={paused} onClick={() => setPaused(value => !value)}>움직임 멈추기</PreviewToolButton></PreviewTools>
  <Text role="status">{message}</Text>
  <ContentTransition stateKey="live-list" animateHeight motion={paused ? 'none' : 'system'}>
   {items.length ? <List label="편집 중인 기록" separator="full">{items.map(item =>
    <ContentTransition key={item.id} stateKey={item.id} enterOnMount={item.arrived} preset="rise" motion={paused ? 'none' : 'system'}>
     <ListRow title={item.title} description="내용은 이 기록에 저장돼요."/>
     {/* The memo starts on the row's text edge: ListRow pads its content by the density inset, a bare field does not. */}
     <TextField label={`${item.title} 메모`} value={item.note} onValueChange={value => edit(item.id, value)} layoutStyle={{ marginInline: rowInset }}/>
    </ContentTransition>)}</List> : <EmptyState title="기록이 없어요" description="새 기록을 추가해 보세요."/>}
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
