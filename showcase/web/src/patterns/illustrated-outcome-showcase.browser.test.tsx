import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { HjmProvider } from '@hjmds/react/provider';
import { IllustratedOutcomePreview } from './illustrated-outcome-preview';
import '@hjmds/react/styles.css';
let host:HTMLDivElement,root:Root;
beforeEach(async()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.append(host);root=createRoot(host);await act(async()=>root.render(<HjmProvider reducedMotion><IllustratedOutcomePreview/></HjmProvider>));});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const button=(name:string)=>page.getByRole('button',{name,exact:true});
const click=(name:string)=>act(async()=>button(name).click());
const element=(name:string)=>{const node=button(name).element();if(!(node instanceof HTMLElement))throw new Error('Expected an HTML control');return node;};
const enter=(name:string)=>act(async()=>{element(name).focus();await userEvent.keyboard('{Enter}');});
const input=()=>host.querySelector<HTMLInputElement>('input.hjm-field__input')!;
const type=(value:string)=>act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input(),value);input().dispatchEvent(new Event('input',{bubbles:true}));});
it('moves focus through the real flow and preserves its draft across back and restart',async()=>{
 await enter('기록 시작하기');expect(document.activeElement?.textContent).toBe('작은 장면부터 기록해요');await enter('다음');expect(document.activeElement).toBe(input());await type('  ');expect(button('체험 완료').element().hasAttribute('disabled')).toBe(true);await type('오늘의 산책');await enter('이전');await enter('다음');expect(input().value).toBe('오늘의 산책');await enter('체험 완료');expect(page.getByRole('status').element().textContent).toContain('입력한 제목: 오늘의 산책');expect(document.activeElement).toBe(page.getByRole('status').element());await enter('다시 체험하기');expect(document.activeElement).toBe(button('기록 시작하기').element());await enter('기록 시작하기');await enter('다음');expect(input().value).toBe('오늘의 산책');
});
it('keeps actions and input available when decorative artwork errors or is hidden',async()=>{
 const artwork=host.querySelector('img')!;expect(artwork.alt).toBe('');await act(async()=>artwork.dispatchEvent(new Event('error')));expect(host.querySelector('img')).toBeNull();await click('기록 시작하기');await click('다음');await type('그림 없는 기록');const field=input();await act(async()=>field.focus());await click('그림 없이 보기');expect(input()).toBe(field);expect(input().value).toBe('그림 없는 기록');await click('그림 다시 보기');await click('체험 완료');const tick=host.querySelector('img')!;expect(tick.alt).toBe('');await act(async()=>tick.dispatchEvent(new Event('error')));expect(host.querySelector('img')).toBeNull();expect(page.getByRole('status').element().textContent).toContain('그림 없는 기록');await click('다시 체험하기');expect(button('기록 시작하기').element()).toBeVisible();
});

it('preserves focus outside the preview and does not recover an explicitly blurred control',async()=>{
 const outside=document.createElement('button');outside.textContent='외부 행동';document.body.append(outside);
 try{outside.focus();await act(async()=>element('기록 시작하기').click());expect(document.activeElement).toBe(outside);await enter('다음');await type('초점 보존');await enter('체험 완료');await enter('다시 체험하기');await act(async()=>{const start=element('기록 시작하기');start.focus();start.click();start.blur();});expect(document.activeElement).toBe(document.body);}
 finally{outside.remove();}
});
it('preserves artwork-toggle focus when pointer activation does not focus the start button',async()=>{
 const toggle=element('그림 없이 보기'),start=element('기록 시작하기');let focusAtActivation:Element|null=null;
 await act(async()=>toggle.focus());start.addEventListener('click',()=>{focusAtActivation=document.activeElement;},{once:true});await click('기록 시작하기');
 // Compare against actual click-time focus: WebKit may explicitly blur to body.
 if(focusAtActivation===start)expect(document.activeElement?.textContent).toBe('작은 장면부터 기록해요');
 else expect(document.activeElement).toBe(focusAtActivation);
});
