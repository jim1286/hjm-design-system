import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { HjmProvider } from '@hjmds/react/provider';
import { ChatMessagePreview, ComposerPreview, NotificationItemPreview } from './conversation-previews';
import '../../../../packages/react/src/styles.css';
let host:HTMLDivElement, root:Root;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const render=(ui:ReactNode)=>act(async()=>root.render(<HjmProvider reducedMotion>{ui}</HjmProvider>));
const button=(label:string)=>[...document.querySelectorAll<HTMLButtonElement>('button')].find(n=>n.textContent===label||n.getAttribute('aria-label')===label)!;
const click=(label:string)=>act(async()=>{button(label).focus();button(label).click();});
const settle=()=>act(async()=>{await new Promise(r=>setTimeout(r,400));});
const fill=(value:string)=>act(async()=>{const input=host.querySelector('textarea')!;Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')!.set!.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));});
for(const purpose of ['comment','message'] as const)it(`keeps ${purpose} draft and reply through failure, then sends the current edited draft once`,async()=>{
 await render(<ComposerPreview purpose={purpose}/>);await fill('처음 초안');await click(purpose==='comment'?'답글 대상 선택':'답장할 메시지 선택');await click('다음 전송 실패시키기');const send=purpose==='comment'?'등록':'전송';await click(send);expect(host.querySelector('textarea')!.readOnly).toBe(true);await settle();expect(host.querySelector('textarea')!.value).toBe('처음 초안');expect(button(purpose==='comment'?'답글 취소':'답장 취소')).toBeDefined();await fill('고친 초안');const action=button(send);await act(async()=>{action.focus();});await act(async()=>userEvent.keyboard('{Enter}'));expect(document.activeElement).toBe(host.querySelector('textarea'));await settle();expect(host.querySelector('textarea')!.value).toBe('');expect(host.textContent).toContain('고친 초안');expect(host.textContent).not.toContain('처음 초안');expect(button(purpose==='comment'?'답글 취소':'답장 취소')).toBeUndefined();
});
it('retains photos on failure, blocks pending removal and sends photo-only content once',async()=>{
 await render(<ComposerPreview purpose="message" initialPhotos={2}/>);await click('다음 전송 실패시키기');await click('전송');expect(button('사진 1 삭제').disabled).toBe(true);await settle();expect(button('사진 2 삭제')).toBeDefined();await click('사진 1 삭제');const send=button('전송');await act(async()=>{send.click();send.click();});await settle();expect(host.textContent?.split('사진 1장')).toHaveLength(2);expect(button('사진 1 삭제')).toBeUndefined();
});
it('keeps keyboard focus on an optimistic notification and rolls back only its failed read',async()=>{
 await render(<NotificationItemPreview/>);await click('다음 읽음 처리 실패시키기');const rows=()=>[...host.querySelectorAll<HTMLButtonElement>('.hjm-notification-item')];const first=rows()[0]!;first.focus();await act(async()=>userEvent.keyboard('{Enter}'));expect(document.activeElement).toBe(first);expect(first.textContent).toContain('확인함');await act(async()=>rows()[1]!.click());expect(rows()[1]!.textContent).toContain('새 알림');await settle();expect(first.textContent).toContain('새 알림');await act(async()=>first.click());await settle();expect(first.textContent).toContain('확인함');await act(async()=>rows()[1]!.click());await settle();expect(first.textContent).toContain('확인함');expect(rows()[1]!.textContent).toContain('확인함');
});
it('announces a successful resend and preserves a useful focus after its action disappears',async()=>{
 await render(<ChatMessagePreview/>);await click('다음 전송 실패시키기');await click('다시 보내기');await settle();expect(host.textContent).toContain('다시 보내지 못했어요.');await click('다시 보내기');await settle();expect(button('다시 보내기')).toBeUndefined();const status=host.querySelector('[role=status]');expect(status?.textContent).toBe('메시지를 전송했어요.');expect(document.activeElement).toBe(status);
});
it('does not steal focus moved outside a resend and resets an unmounted composer session',async()=>{
 await render(<ChatMessagePreview/>);await click('다시 보내기');const external=document.createElement('button');host.append(external);external.focus();await settle();expect(document.activeElement).toBe(external);external.remove();await render(<ComposerPreview/>);await fill('이전 초안');await click('등록');await render(<ComposerPreview key="replacement"/>);await settle();expect(host.querySelector('textarea')!.value).toBe('');expect(host.textContent).not.toContain('이전 초안');
});

it('connects reaction selection, clearing and reply navigation to the example state',async()=>{
 await render(<ChatMessagePreview/>);const bubble=host.querySelector<HTMLElement>('[aria-label="메시지에 반응"]')!;
 bubble.focus();await act(async()=>userEvent.keyboard('{Enter}'));await click('좋아요');await act(async()=>{await new Promise(r=>setTimeout(r,80));});expect(host.querySelector('.hjm-chat-message__meta')?.textContent).toContain('❤️');
 bubble.focus();await act(async()=>userEvent.keyboard('{Enter}'));await click('좋아요');await act(async()=>{await new Promise(r=>setTimeout(r,80));});expect(host.querySelector('.hjm-chat-message__meta')?.textContent).not.toContain('❤️');
 const incoming=host.querySelector('article')!;await act(async()=>{incoming.focus();incoming.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',altKey:true,bubbles:true}));});expect(host.textContent).toContain('답장을 준비했어요.');await click('원문 메시지로 이동');expect(host.textContent).toContain('원문 메시지를 표시했어요.');
});
it('preserves an explicit resend blur when confirmation removes the action',async()=>{
 await render(<ChatMessagePreview/>);await click('다시 보내기');button('다시 보내기').blur();await settle();expect(document.activeElement).toBe(document.body);
});

it('preserves the new-message draft through edit cancellation, failure, save and confirmed deletion', async () => {
 await render(<ChatMessagePreview/>);
 const menu = async () => { const trigger=host.querySelector<HTMLElement>('[aria-label="보낸 메시지 메뉴"]')!;trigger.focus();await act(async()=>userEvent.keyboard('{Enter}')); };
 await menu();await click('메시지 수정');await click('수정 취소');
 expect(host.querySelector('textarea')!.value).toBe('작성하던 새 메시지');
 await menu();await click('메시지 수정');await fill('수정한 약속');await click('다음 메시지 변경 실패시키기');await click('수정 저장');await settle();
 expect(host.querySelector('textarea')!.value).toBe('수정한 약속');expect(host.textContent).toContain('작성한 내용은 그대로예요.');
 await click('수정 저장');await settle();expect(host.textContent).toContain('수정한 약속');expect(host.textContent).toContain('수정됨');expect(host.querySelector('textarea')!.value).toBe('작성하던 새 메시지');
 await menu();await click('메시지 삭제');await click('취소');expect(host.textContent).toContain('수정한 약속');
 await menu();await click('메시지 삭제');await click('삭제');await settle();expect(host.textContent).toContain('삭제된 메시지입니다');expect(host.querySelector('[aria-label="보낸 메시지 메뉴"]')).toBeNull();expect(host.querySelector('textarea')!.value).toBe('작성하던 새 메시지');
});

it('hides group unread metadata after the last participant reads', async () => {
 await render(<ChatMessagePreview/>);
 expect(host.textContent).toContain('안 읽음 2명');
 await click('참여자 한 명 읽음');expect(host.textContent).toContain('안 읽음 1명');
 await click('참여자 한 명 읽음');expect(host.textContent).not.toContain('안 읽음');
});
