import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { ContentTransitionComparison } from './content-transition-comparison-preview';
import { PaperSurfacePreview } from './paper-surface-preview';
import '@hjmds/react/styles.css';
let host:HTMLDivElement,root:Root;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const render=(mode:'tabs'|'steps')=>act(async()=>root.render(<ContentTransitionComparison mode={mode}/>));
const click=(name:string)=>act(async()=>page.getByRole('button',{name,exact:true}).click());
// Theme and failure are preview tools: a theme radio group and an on/off chip (2026-10-17 review).
const theme=(name:string)=>act(async()=>page.getByText(name,{exact:true}).click());
const toggle=(name:string)=>act(async()=>page.getByText(name,{exact:true}).click());
const input=()=>host.querySelector<HTMLInputElement>('input.hjm-field__input')!;
const type=(value:string)=>act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input(),value);input().dispatchEvent(new Event('input',{bubbles:true}));});
it('keeps one draft across manual tabs, transition appearance and themes',async()=>{
 await render('tabs');await type('보존할 초안');const plan=page.getByRole('tab',{name:'계획',exact:true}).element();plan.focus();await act(async()=>userEvent.keyboard('{ArrowRight}'));expect(page.getByRole('tab',{name:'계획',exact:true}).element().getAttribute('aria-selected')).toBe('true');await act(async()=>userEvent.keyboard('{Enter}'));expect(page.getByRole('tab',{name:'작성',exact:true}).element().getAttribute('aria-selected')).toBe('true');expect(input().value).toBe('보존할 초안');await act(async()=>page.getByText('즉시',{exact:true}).click());await theme('숲');expect(input().value).toBe('보존할 초안');expect(host.querySelectorAll('input.hjm-field__input')).toHaveLength(1);
});
it('retains the draft on failure, retries and restores input focus on restart',async()=>{
 await render('steps');await type('확인할 초안');await click('다음');await click('다음');await toggle('완료 실패 재현');await click('기록 확인');expect(host.textContent).toContain('확인하지 못했어요. 초안은 남아 있어요.');expect(input().value).toBe('확인할 초안');await click('기록 확인');await expect.poll(()=>document.activeElement?.textContent).toBe('다시 비교');await click('다시 비교');expect(input().value).toBe('확인할 초안');await expect.poll(()=>document.activeElement).toBe(input());
});
it('keeps confirmed content separate from a draft edited in the other comparison mode',async()=>{
 await render('steps');await type('확인된 기록');await click('다음');await click('다음');await click('기록 확인');await render('tabs');await type('아직 확인 안 한 초안');await render('steps');expect(host.textContent).toContain('확인된 기록');expect(host.textContent).not.toContain('아직 확인 안 한 초안');await click('다시 비교');expect(input().value).toBe('아직 확인 안 한 초안');
});
it('keeps paper draft and confirmed snapshot while changing material and returns dialog focus',async()=>{
 await act(async()=>root.render(<PaperSurfacePreview/>));await type('확인한 산책');await click('기록 확인');await type('다음 산책 초안');await act(async()=>page.getByRole('radio',{name:'줄무늬 추가',exact:true}).click());await act(async()=>page.getByRole('radio',{name:'넓게 40',exact:true}).click());await theme('숲');expect(input().value).toBe('다음 산책 초안');expect(page.getByRole('status').element().textContent).toBe('초안 확인: 확인한 산책');await click('자세히 읽기');expect(page.getByRole('dialog').element().textContent).toContain('다음 산책 초안');await click('닫기');await expect.poll(()=>document.activeElement?.textContent).toBe('자세히 읽기');await act(async()=>page.getByRole('radio',{name:'줄무늬 없는 면',exact:true}).click());expect(page.getByRole('radio',{name:'넓게 40',exact:true}).element().matches(':disabled')).toBe(true);expect(input().value).toBe('다음 산책 초안');
});
