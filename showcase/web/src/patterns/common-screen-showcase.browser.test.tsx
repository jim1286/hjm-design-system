import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { HjmProvider } from '@hjmds/react/provider';
import { LoginScreenPreview, NotificationScreenPreview, ChatScreenPreview } from './common-screen-previews';
import '@hjmds/react/styles.css';
let host:HTMLDivElement,root:Root;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const render=(ui:ReactNode)=>act(async()=>root.render(<HjmProvider reducedMotion>{ui}</HjmProvider>));
const button=(name:string)=>page.getByRole('button',{name,exact:true});
const click=(name:string)=>act(async()=>button(name).click());
const radio=(name:string)=>page.getByRole('radio',{name,exact:true});
const choose=(name:string)=>act(async()=>radio(name).click());
// Preview on/off tools render as selection chips (preview-tools.tsx), exposed as checkboxes.
const toggle=(name:string)=>act(async()=>page.getByRole('checkbox',{name,exact:true}).click());
const wait=(ms:number)=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,ms));});
const openNotification=(title:string)=>act(async()=>page.getByRole('button',{name:new RegExp(title)}).click());
it('cancels a same-render duplicate login and restarts without an old completion',async()=>{
 await render(<LoginScreenPreview/>);await act(async()=>{for(const name of ['Google','Apple']){const provider=button(name).element();if(!(provider instanceof HTMLButtonElement))throw new Error('Expected a provider button');provider.click();}});await click('예제 로그인 취소');await wait(650);expect(host.textContent).not.toContain('나의 공간');expect(button('Google').element()).toBeVisible();await click('Apple');await wait(650);expect(host.textContent).toContain('나의 공간');
});
it('retries the first demo login failure and cancels the fixture pending state quietly',async()=>{
 await render(<LoginScreenPreview stateKind="error"/>);await click('Google');await wait(650);expect(host.textContent).toContain('로그인하지 못했어요');await click('Google');await wait(650);expect(host.textContent).toContain('나의 공간');await click('서연과의 대화');expect(host.querySelector('textarea')).not.toBeNull();await render(<LoginScreenPreview key="pending" stateKind="loading"/>);await click('예제 로그인 취소');expect(host.textContent).not.toContain('로그인하지 못했어요');expect(button('Apple').element()).toBeVisible();
});
it('shows an empty unread inbox after detail visits and only links the demonstrated conversation',async()=>{
 await render(<NotificationScreenPreview/>);await choose('읽지 않음');expect(radio('읽지 않음').element().getAttribute('aria-checked')).toBe('true');expect(radio('전체').element().getAttribute('aria-checked')).toBe('false');await openNotification('서연님이 답글을 남겼어요');expect(button('대화 이어가기').element()).toBeVisible();await click('뒤로');await openNotification('민준님이 내 이야기에 공감했어요');expect(host.textContent).not.toContain('대화 이어가기');await click('뒤로');await openNotification('함께 나누던 대화가 이어졌어요');expect(host.textContent).not.toContain('대화 이어가기');await click('뒤로');expect(host.textContent).toContain('모두 확인했어요');expect(host.textContent).not.toContain('이번 주');expect(document.activeElement).toBe(radio('읽지 않음').element());await choose('전체');expect(host.textContent).toContain('서연님이 답글을 남겼어요');
});
it('preserves chat draft on detail return and moves keyboard focus to the reply original',async()=>{
 await render(<ChatScreenPreview/>);const input=host.querySelector('textarea')!;await act(async()=>{Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')!.set!.call(input,'이어 쓸 답장');input.dispatchEvent(new Event('input',{bubbles:true}));});await click('대화 정보');await click('뒤로');expect(host.querySelector('textarea')!.value).toBe('이어 쓸 답장');await click('원문 메시지로 이동');expect(document.activeElement?.textContent).toContain('오늘 날씨 정말 좋네요.');expect(document.activeElement?.textContent).not.toContain('그럼 입구에서 만나요!');
});

it('keeps a read-failure tool from failing an unrelated chat send',async()=>{
 await render(<NotificationScreenPreview tools/>);await toggle('다음 읽음 저장 실패');await click('뒤로');await click('서연과의 대화');const input=host.querySelector('textarea')!;await act(async()=>{Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')!.set!.call(input,'정상 전송');input.dispatchEvent(new Event('input',{bubbles:true}));});await click('전송');expect(host.querySelector('textarea')!.value).toBe('');expect(host.textContent).not.toContain('보내지 못했어요');
});

it('contains a failed read in the inbox and retries that row after returning',async()=>{
 await render(<NotificationScreenPreview tools/>);await toggle('다음 읽음 저장 실패');await openNotification('서연님이 답글을 남겼어요');expect(host.textContent).toContain('읽음 표시를 저장하지 못했어요');expect(host.querySelector('[data-notification-id="1"]')!.getAttribute('data-unread')).toBe('true');await click('뒤로');await click('서연과의 대화');expect(host.textContent).not.toContain('읽음 표시를 저장하지 못했어요');await click('뒤로');await click('알림');await openNotification('서연님이 답글을 남겼어요');await click('뒤로');expect(document.activeElement).toBe(host.querySelector('[data-notification-id="1"]'));expect(host.querySelector('[data-notification-id="1"]')!.getAttribute('data-unread')).toBeNull();
});
