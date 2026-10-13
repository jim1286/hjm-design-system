import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { HjmProvider } from '@hjmds/react/provider';
import { LandingPreview } from '../../../showcase/web/src/patterns/landing-preview.js';
import { landingCopy as copy } from '../../../showcase/shared/landing-pattern.js';
import '../src/styles.css';
let host:HTMLDivElement,root:Root;
beforeEach(async()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.append(host);root=createRoot(host);await act(async()=>root.render(<HjmProvider reducedMotion><LandingPreview/></HjmProvider>));});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const buttons=(label:string)=>[...document.querySelectorAll('button')].filter(node=>node.textContent?.startsWith(label));
const press=(button:HTMLButtonElement)=>act(async()=>{button.focus();button.click();});
const closed=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,80));});
const input=()=>document.querySelector<HTMLInputElement>('input')!;
const fill=(value:string)=>act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input(),value);input().dispatchEvent(new Event('input',{bubbles:true}));});
it('retains a cancelled draft between both CTAs, saves once and starts the next note empty',async()=>{
 const top=buttons(copy.cta)[0]!,bottom=buttons(copy.cta)[1]!;await press(top);await fill('  내 기록  ');await press(document.querySelector<HTMLButtonElement>(`button[aria-label="${copy.close}"]`)!);await closed();expect(document.activeElement).toBe(top);expect(host.textContent).not.toContain('내 기록  ');
 await press(bottom);expect(input().value).toBe('  내 기록  ');const submit=buttons(copy.submit)[0]!;await act(async()=>{submit.click();submit.click();});await closed();expect(document.activeElement).toBe(bottom);expect([...host.querySelectorAll('.hjm-list-row')].filter(row=>row.textContent==='내 기록')).toHaveLength(1);expect(host.textContent).toContain(copy.saved);
 await press(top);expect(input().value).toBe('');
});
it('keeps empty input errors in the sheet and lets Enter save the corrected note',async()=>{
 await press(buttons(copy.cta)[0]!);await fill('   ');await press(buttons(copy.submit)[0]!);expect(document.querySelector('[role=dialog]')).not.toBeNull();expect(input().getAttribute('aria-invalid')).toBe('true');expect(document.activeElement).toBe(input());
 await fill('다음 기록');expect(input().getAttribute('aria-invalid')).not.toBe('true');input().focus();await act(async()=>userEvent.keyboard('{Enter}'));await closed();expect(document.querySelector('[role=dialog]')).toBeNull();expect(host.textContent).toContain('다음 기록');
});
it('toggles FAQs independently and returns focus to the triggering CTA on Escape',async()=>{
 const first=buttons(copy.faqs[0]!.question)[0]!,second=buttons(copy.faqs[1]!.question)[0]!;await press(first);expect(first.getAttribute('aria-expanded')).toBe('true');await press(second);expect(first.getAttribute('aria-expanded')).toBe('true');expect(second.getAttribute('aria-expanded')).toBe('true');await press(first);expect(first.getAttribute('aria-expanded')).toBe('false');
 const bottom=buttons(copy.cta)[1]!;await press(bottom);await act(async()=>userEvent.keyboard('{Escape}'));await closed();expect(document.activeElement).toBe(bottom);
});

it('commits only one note for two submit events in the same render',async()=>{await press(buttons(copy.cta)[0]!);await fill('중복 방지');const save=buttons(copy.submit)[0]!;await act(async()=>{save.click();save.click();});await closed();expect([...host.querySelectorAll('.hjm-list-row')].filter(row=>row.textContent==='중복 방지')).toHaveLength(1);});

it('does not save while the IME confirms composition and saves the next Enter once',async()=>{
 await press(buttons(copy.cta)[0]!);await fill('조합 중');input().focus();await act(async()=>input().dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true})));expect(document.querySelector('[role=dialog]')).not.toBeNull();await act(async()=>userEvent.keyboard('{Enter}'));await closed();expect([...host.querySelectorAll('.hjm-list-row')].filter(row=>row.textContent==='조합 중')).toHaveLength(1);
});
