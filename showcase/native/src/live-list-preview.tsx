import { useState } from 'react';
import { ScrollView } from 'react-native';
import { KeyboardAvoiding } from '@hjmds/react-native/keyboard';
import { spacing } from '@hjmds/design-contracts/foundations';
import { Button } from '@hjmds/react-native/actions';
import { PreviewTools, PreviewToolButton } from './preview-tools';
import { Stack, Text } from '@hjmds/react-native/primitives';
import { List, ListRow } from '@hjmds/react-native/data-display';
import { TextField } from '@hjmds/react-native/inputs';
import { EmptyState } from '@hjmds/react-native/feedback';
import { listRowRecipe } from '@hjmds/design-contracts/recipes';
import { ContentTransition } from '@hjmds/react-native/content-transition';
import { initialLiveList, updateLiveList } from '../../shared/live-list';
import { PatternStatus } from './pattern-status';
const rowInset = listRowRecipe.density.comfortable.paddingHorizontal;
export function LiveListPreview() {
 const { items, paused, setPaused, message, add, remove, reverse, edit } = useLiveList();
 // The Storybook canvas does not scroll; growing rows need an explicit input-aware host.
 return <KeyboardAvoiding style={{ flex: 1 }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.md }}><Stack gap="lg"><Text>메모를 입력한 뒤 기록을 추가하거나 순서를 바꿔 보세요. 기존 입력은 그대로 남아요.</Text>
  <Stack axis="inline" gap="sm" wrap><Button onPress={() => add(1)}>기록 추가</Button><Button tone="secondary" onPress={() => add(3)}>3개 함께 추가</Button>
   <Button tone="secondary" disabled={items.length < 2} onPress={reverse}>순서 뒤집기</Button><Button tone="secondary" disabled={items.length === 0} onPress={remove}>첫 기록 삭제</Button></Stack>
  <PreviewTools><PreviewToolButton selected={paused} onPress={() => setPaused(value => !value)}>움직임 멈추기</PreviewToolButton></PreviewTools>
  <PatternStatus>{message}</PatternStatus>
  <ContentTransition stateKey="live-list" animateHeight motion={paused ? 'none' : 'system'}>
   {items.length ? <List label="편집 중인 기록" separator="full">{items.map(item =>
    <ContentTransition key={item.id} stateKey={item.id} enterOnMount={item.arrived} preset="rise" motion={paused ? 'none' : 'system'}>
     <ListRow title={item.title} description="내용은 이 기록에 저장돼요."/>
     {/* The memo starts on the row's text edge: ListRow pads its content by the density inset, a bare field does not. */}
     <TextField label={`${item.title} 메모`} value={item.note} onValueChange={value => edit(item.id, value)} layoutStyle={{ marginHorizontal: rowInset }}/>
    </ContentTransition>)}</List> : <EmptyState title="기록이 없어요" description="새 기록을 추가해 보세요."/>}
  </ContentTransition>
 </Stack></ScrollView></KeyboardAvoiding>;
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
