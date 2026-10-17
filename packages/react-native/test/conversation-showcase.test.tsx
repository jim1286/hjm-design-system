import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { ReactNode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { HjmNativeProvider } from '@hjmds/react-native/provider';
import { Chip } from "@hjmds/react-native/inputs";
import { Button } from '@hjmds/react-native/actions';
import { ChatMessage, MessageComposer, NotificationItem } from '@hjmds/react-native/screens';
import { ChatMessagePreview, ComposerPreview, NotificationItemPreview } from '../../../showcase/native/src/conversation-previews';
// Photo pixels are outside these composer callback/lifecycle tests.
vi.mock('../../../showcase/native/src/reference-screen-parts',()=>({PreviewPhoto:()=>null}));
vi.mock('react-native-svg',async()=>{const {View}=await import('react-native');return {default:View,Svg:View,Circle:View,Path:View,G:View,Rect:View,Line:View,Polyline:View,Polygon:View,Ellipse:View};});
vi.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({top:0,bottom:0,left:0,right:0})}));
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer;afterEach(()=>{if(tree)act(()=>tree.unmount());});
const render=(ui:ReactNode)=>act(()=>{tree=create(<HjmNativeProvider reducedMotion>{ui}</HjmNativeProvider>);});
// 미리보기 도구 on/off tools are selection chips named by `label`; product actions are Buttons.
const button = (label: string) => tree.root.findAll(node => (node.type === Button && node.props.children === label) || (node.type === Chip && node.props.label === label))[0]!;
const press=(label:string)=>act(()=>button(label).props.onPress());
const settle=()=>act(async()=>{await new Promise(r=>setTimeout(r,400));});
const composer=()=>tree.root.findByType(MessageComposer);
const text=()=>tree.root.findAll(node=>String(node.type)==='Text').map(node=>node.children.filter(child=>typeof child==='string').join('')).join(' ');
for(const purpose of ['comment','message'] as const)it(`keeps native ${purpose} draft and reply after failure, sends edited content once and clears on success`,async()=>{
 render(<ComposerPreview purpose={purpose}/>);act(()=>composer().props.onValueChange('처음 초안'));press(purpose==='comment'?'답글 대상 선택':'답장할 메시지 선택');press('다음 전송 실패시키기');act(()=>void composer().props.onSend('처음 초안'));expect(composer().props.pending).toBe(true);await settle();expect(composer().props.value).toBe('처음 초안');expect(composer().props.replyTo).toBeDefined();act(()=>composer().props.onValueChange('고친 초안'));const send=composer().props.onSend;act(()=>{void send('고친 초안');void send('고친 초안');});await settle();expect(composer().props.value).toBe('');expect(composer().props.replyTo).toBeUndefined();expect(text().split('고친 초안')).toHaveLength(2);
});
it('keeps native photos after failure and sends a remaining photo without text',async()=>{
 render(<ComposerPreview purpose="message" initialPhotos={2}/>);press('다음 전송 실패시키기');act(()=>void composer().props.onSend(''));await settle();expect(composer().props.attachments).toHaveLength(2);act(()=>composer().props.onRemoveAttachment('0'));act(()=>void composer().props.onSend(''));await settle();expect(composer().props.attachments).toHaveLength(0);expect(text()).toContain('사진 1장');
});
it('announces native resend success after failure while retaining message and reaction state',async()=>{
 render(<ChatMessagePreview/>);const incoming=()=>tree.root.findAllByType(ChatMessage)[0]!;act(()=>incoming().props.reactions.onValueChange('heart'));expect(incoming().props.reactions.value).toBe('heart');act(()=>incoming().props.replyAction.onPress());expect(text()).toContain('답장을 준비했어요.');press('다음 전송 실패시키기');press('다시 보내기');await settle();expect(text()).toContain('다시 보내지 못했어요.');press('다시 보내기');await settle();expect(text()).toContain('메시지를 전송했어요.');expect(button('다시 보내기')).toBeUndefined();expect(incoming().props.reactions.value).toBe('heart');act(()=>incoming().props.reactions.onValueChange(null));expect(incoming().props.reactions.value).toBeNull();
});
it('serializes native optimistic read requests and preserves earlier confirmed reads on rollback',async()=>{
 render(<NotificationItemPreview/>);const rows=()=>tree.root.findAllByType(NotificationItem);const first=rows()[0]!.props.onPress, second=rows()[1]!.props.onPress;act(()=>{first();second();});expect(rows()[0]!.props.read).toBe(true);expect(rows()[1]!.props.read).toBe(false);await settle();press('다음 읽음 처리 실패시키기');act(()=>rows()[1]!.props.onPress());await settle();expect(rows()[0]!.props.read).toBe(true);expect(rows()[1]!.props.read).toBe(false);act(()=>rows()[1]!.props.onPress());await settle();expect(rows()[1]!.props.read).toBe(true);
});
it('ignores an old native composer completion after unmount',async()=>{
 render(<ComposerPreview/>);act(()=>composer().props.onValueChange('이전 초안'));act(()=>void composer().props.onSend('이전 초안'));act(()=>tree.update(<HjmNativeProvider reducedMotion><ComposerPreview key="new"/></HjmNativeProvider>));await settle();expect(composer().props.value).toBe('');expect(text()).not.toContain('이전 초안');
});
