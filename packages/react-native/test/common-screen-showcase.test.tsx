import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { ReactNode } from 'react';
import { FlatList } from 'react-native';
import { afterEach, expect, it, vi } from 'vitest';
import { HjmNativeProvider } from '@hjmds/react-native/provider';
import { ListRow } from '@hjmds/react-native/data-display';
import { Button, IconButton } from '@hjmds/react-native/actions';
import { ChatMessage, MessageComposer, NotificationItem, NotificationInboxScreen } from '@hjmds/react-native/screens';
import { AuthProviderButton } from '@hjmds/react-native/provider-button';
import { Chip } from '@hjmds/react-native/inputs';
import { LoginScreenPreview, NotificationScreenPreview, ChatScreenPreview } from '../../../showcase/native/src/common-screen-previews';
vi.mock('react-native-svg',async()=>{const {View}=await import('react-native');return {default:View,Svg:View,Circle:View,Path:View,G:View,Rect:View,Line:View,Polyline:View,Polygon:View,Ellipse:View};});
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer;
afterEach(async()=>{if(tree)await act(async()=>tree.unmount());vi.useRealTimers();vi.restoreAllMocks();});
const render=(ui:ReactNode)=>act(async()=>{tree=create(<HjmNativeProvider reducedMotion>{ui}</HjmNativeProvider>,{createNodeMock:()=>({scrollToIndex:vi.fn(),scrollToOffset:vi.fn()})});});
const button=(label:string)=>tree.root.findAllByType(Button).find(n=>n.props.children===label)!;
const press=(label:string)=>act(()=>button(label).props.onPress());
const chip=(label:string)=>tree.root.findAllByType(Chip).find(n=>n.props.label===label)!;
const choose=(label:string)=>act(()=>chip(label).props.onPress(true));
const back=()=>act(()=>tree.root.findAllByType(IconButton).find(n=>n.props.label==='뒤로')!.props.onPress());
const text=()=>tree.root.findAll(node=>String(node.type)==='Text').map(node=>node.children.filter(child=>typeof child==='string').join('')).join(' ');
const advance=(ms:number)=>act(async()=>{await vi.advanceTimersByTimeAsync(ms);});
it('serializes provider callbacks, cancels all pending work and allows a fresh login',async()=>{
 vi.useFakeTimers();await render(<LoginScreenPreview/>);const providers=tree.root.findAllByType(AuthProviderButton);act(()=>{providers[0]!.props.onPress();providers[1]!.props.onPress();});press('예제 로그인 취소');await advance(650);expect(text()).not.toContain('나의 공간');act(()=>tree.root.findAllByType(AuthProviderButton)[1]!.props.onPress());await advance(650);expect(text()).toContain('나의 공간');
});
it('detaches a held login completion after cancellation and on unmount',async()=>{
 vi.useFakeTimers();const schedule=vi.spyOn(globalThis,'setTimeout');await render(<LoginScreenPreview/>);act(()=>tree.root.findAllByType(AuthProviderButton)[0]!.props.onPress());const job=schedule.mock.calls.find(args=>args[1]===600)![0];press('예제 로그인 취소');act(()=>{if(typeof job==='function')job();});expect(text()).not.toContain('나의 공간');act(()=>tree.root.findAllByType(AuthProviderButton)[0]!.props.onPress());act(()=>tree.unmount());expect(vi.getTimerCount()).toBe(0);
});
it('shows unread empty state after all unread rows are opened and returned',async()=>{
 await render(<NotificationScreenPreview/>);choose('읽지 않음');expect(chip('읽지 않음').props.selected).toBe(true);expect(chip('전체').props.selected).toBe(false);for(let i=0;i<3;i++){act(()=>tree.root.findAllByType(NotificationItem)[0]!.props.onPress());back();}expect(tree.root.findByType(NotificationInboxScreen).props.state.kind).toBe('empty');choose('전체');expect(tree.root.findAllByType(NotificationItem)).toHaveLength(4);
});
it('does not route an unrelated notification into the fixed Soyeon conversation',async()=>{
 await render(<NotificationScreenPreview/>);act(()=>tree.root.findAllByType(NotificationItem)[1]!.props.onPress());expect(Boolean(button('대화 이어가기'))).toBe(false);back();act(()=>tree.root.findAllByType(NotificationItem)[0]!.props.onPress());press('대화 이어가기');expect(tree.root.findByType(MessageComposer)).toBeDefined();
});
it('preserves chat input and reply ownership while visiting conversation details',async()=>{
 await render(<ChatScreenPreview/>);const composer=()=>tree.root.findByType(MessageComposer);act(()=>composer().props.onValueChange('작성 중인 답장'));act(()=>tree.root.findAllByType(ChatMessage)[0]!.props.replyAction.onPress());act(()=>tree.root.findAllByType(IconButton).find(n=>n.props.label==='대화 정보')!.props.onPress());back();expect(composer().props.value).toBe('작성 중인 답장');expect(composer().props.replyTo.author).toBe('서연에게 답장');act(()=>composer().props.replyTo.onCancel());expect(composer().props.value).toBe('작성 중인 답장');expect(composer().props.replyTo).toBeUndefined();
});

it('restarts the original-message highlight when the same reply is followed again',async()=>{
 vi.useFakeTimers();await render(<ChatScreenPreview/>);const jump=()=>act(()=>tree.root.findAllByType(ChatMessage)[5]!.props.replyLink.onPress());jump();await advance(1000);jump();await advance(600);expect(tree.root.findByType(FlatList).props.extraData[0]).toBe('first');await advance(900);expect(tree.root.findByType(FlatList).props.extraData[0]).toBeNull();
});

it('does not carry an armed read failure into a later chat send',async()=>{
 await render(<NotificationScreenPreview tools/>);choose('다음 읽음 저장 실패');back();act(()=>tree.root.findAllByType(ListRow).find(row=>row.props.title==='서연과의 대화')!.props.onPress());const composer=()=>tree.root.findByType(MessageComposer);act(()=>composer().props.onValueChange('정상 전송'));act(()=>composer().props.onSend('정상 전송'));expect(composer().props.value).toBe('');expect(text()).not.toContain('보내지 못했어요');
});

it('keeps an inbox read error out of the conversation composer',async()=>{
 await render(<NotificationScreenPreview tools/>);choose('다음 읽음 저장 실패');act(()=>tree.root.findAllByType(NotificationItem)[0]!.props.onPress());expect(text()).toContain('읽음 표시를 저장하지 못했어요');expect(tree.root.findAllByType(NotificationItem)[0]!.props.read).toBe(false);back();act(()=>tree.root.findAllByType(ListRow).find(row=>row.props.title==='서연과의 대화')!.props.onPress());expect(text()).not.toContain('읽음 표시를 저장하지 못했어요');
});

it('enters a ready conversation after retrying the login failure fixture',async()=>{
 vi.useFakeTimers();await render(<LoginScreenPreview stateKind="error"/>);const signIn=()=>act(()=>tree.root.findAllByType(AuthProviderButton)[0]!.props.onPress());signIn();await advance(650);expect(text()).toContain('로그인하지 못했어요');signIn();await advance(650);act(()=>tree.root.findAllByType(ListRow).find(row=>row.props.title==='서연과의 대화')!.props.onPress());expect(tree.root.findAllByType(MessageComposer)).toHaveLength(1);expect(text()).not.toContain('잠시 연결이 끊겼어요');
});

it('opens the peer profile from both chat avatar positions and preserves the draft on return',async()=>{
 await render(<ChatScreenPreview/>);
 act(()=>tree.root.findByType(MessageComposer).props.onValueChange('남겨 둔 메시지'));
 const {ChatScreen}=await import('@hjmds/react-native/screens');
 act(()=>tree.root.findByType(ChatScreen).props.avatarAction.onPress());expect(text()).toContain('산책하며 일상');
 act(()=>tree.root.findAllByType(IconButton).find(n=>n.props.label==='대화로 돌아가기')!.props.onPress());
 expect(tree.root.findByType(MessageComposer).props.value).toBe('남겨 둔 메시지');
 act(()=>tree.root.findAllByType(ChatMessage)[0]!.props.avatarAction.onPress());expect(text()).toContain('산책하며 일상');
});
