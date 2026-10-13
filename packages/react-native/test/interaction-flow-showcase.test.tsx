import type { ComponentType } from "react";
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, expect, it, vi } from 'vitest';
import { HjmNativeProvider } from '@hjmds/react-native/provider';
import { Button } from '@hjmds/react-native/actions';
import { TextField, SearchField } from '@hjmds/react-native/inputs';
import { Sheet } from '@hjmds/react-native/overlays';
import { ApplyOrDiscardSelection, ReopenDraft, LatestSearchWins } from '../../../showcase/native/src/interaction-flow-previews.js';
let tree:ReactTestRenderer;const focus=vi.fn();
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(()=>{if(tree)act(()=>tree.unmount());vi.useRealTimers();focus.mockClear();});
const render=(Component:ComponentType)=>act(()=>{tree=create(<HjmNativeProvider reducedMotion><Component/></HjmNativeProvider>,{createNodeMock:()=>({focus})});});
const button=(name:string)=>tree.root.findAllByType(Button).find(item=>item.props.children===name)!;
const press=(name:string)=>act(()=>button(name).props.onPress());
const text=()=>JSON.stringify(tree.toJSON());
const advance=(ms:number)=>act(async()=>{await vi.advanceTimersByTimeAsync(ms);});
it('ignores a queued apply after cancel and after reopening a new choice session',async()=>{
 vi.useFakeTimers();render(ApplyOrDiscardSelection);press('표시 방식 선택');press('자세하게');const apply=button('선택 적용').props.onPress;act(()=>{button('선택 취소').props.onPress();apply();});expect(text()).toContain('현재 표시: 간결하게');await advance(500);press('표시 방식 선택');act(()=>apply());expect(tree.root.findByType(Sheet).props.open).toBe(true);expect(text()).toContain('현재 표시: 간결하게');press('자세하게');press('선택 적용');expect(text()).toContain('현재 표시: 자세하게');
});
it('rejects late input and save from an explicitly discarded draft',async()=>{
 vi.useFakeTimers();render(ReopenDraft);press('메모 작성');act(()=>tree.root.findByType(TextField).props.onValueChange('버릴 초안'));const save=button('메모 저장').props.onPress,edit=tree.root.findByType(TextField).props.onValueChange;act(()=>{button('초안 버리기').props.onPress();edit('늦은 입력');save();});expect(text()).toContain('아직 없어요');await advance(500);press('메모 작성');expect(tree.root.findByType(TextField).props.value).toBe('');act(()=>save());expect(tree.root.findByType(Sheet).props.open).toBe(true);
});
it('keeps a future failure armed until the next search starts',async()=>{
 vi.useFakeTimers();render(LatestSearchWins);press('느린 응답으로 검색');press('다음 검색 실패시키기');await advance(950);expect(text()).toContain('검색 결과: 일기');press('빠른 응답으로 검색');await advance(200);expect(text()).toContain('검색하지 못했어요');press('다시 검색');expect(focus).toHaveBeenCalled();await advance(200);expect(text()).toContain('검색 결과: 일기');
});
it('detaches old failed responses and cleans up held demo timers on unmount',async()=>{
 vi.useFakeTimers();render(LatestSearchWins);press('다음 검색 실패시키기');press('느린 응답으로 검색');act(()=>tree.root.findByType(SearchField).props.onValueChange('최신'));press('빠른 응답으로 검색');await advance(950);expect(text()).toContain('검색 결과: 최신');act(()=>tree.unmount());act(()=>{tree=create(<HjmNativeProvider reducedMotion><LatestSearchWins initialState="pending"/></HjmNativeProvider>);});act(()=>tree.unmount());expect(vi.getTimerCount()).toBe(0);
});
