import { act, type ComponentType } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { HjmProvider } from "@hjmds/react/provider";
import { ApplyOrDiscardSelection, ReopenDraft, LatestSearchWins } from "./interaction-flow-previews";
import "@hjmds/react/styles.css";
let host:HTMLDivElement,root:Root;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const render=(Component:ComponentType)=>act(async()=>root.render(<HjmProvider reducedMotion><Component/></HjmProvider>));
const click=(name:string)=>act(async()=>page.getByRole('button',{name,exact:true}).click());
// 미리보기 도구 on/off tools are selection chips (checkbox role), not buttons.
const tool=(name:string)=>act(async()=>page.getByRole('checkbox',{name,exact:true}).click());
// 표시 방식 is a RadioGroup (SELECTION.md 조립 규칙): pick an option by its visible label, as a pointer user does; checked state is read from the radio.
const choose=(name:string)=>act(async()=>page.getByRole('dialog').getByText(name,{exact:true}).click());
const input=()=>document.querySelector<HTMLInputElement>('input.hjm-field__input')!;
const type=(value:string)=>act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input(),value);input().dispatchEvent(new Event('input',{bubbles:true}));});
const wait=(ms:number)=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,ms));});
it('applies only confirmed selections and restores pointer and keyboard focus after cancellation',async()=>{
 await render(ApplyOrDiscardSelection);await click('표시 방식 선택');await choose('자세하게');expect(host.textContent).toContain('현재 표시: 간결하게');await act(async()=>userEvent.keyboard('{Escape}'));await expect.poll(()=>document.activeElement?.textContent).toBe('표시 방식 선택');await click('표시 방식 선택');expect((page.getByRole('radio',{name:'간결하게',exact:true}).element() as HTMLInputElement).checked).toBe(true);await choose('자세하게');await click('선택 적용');expect(host.textContent).toContain('현재 표시: 자세하게');await click('표시 방식 선택');await choose('간결하게');await click('선택 취소');expect(host.textContent).toContain('현재 표시: 자세하게');
});
it('keeps closed drafts, discards explicitly and saves without changing previous content on cancel',async()=>{
 await render(ReopenDraft);await click('메모 작성');expect(page.getByRole('button',{name:'메모 저장',exact:true}).element().hasAttribute('disabled')).toBe(true);await type('첫 메모');await click('초안을 남기고 닫기');await expect.poll(()=>document.activeElement?.textContent).toBe('메모 작성');await click('메모 작성');expect(input().value).toBe('첫 메모');await click('메모 저장');expect(host.textContent).toContain('저장된 메모: 첫 메모');await click('메모 작성');expect(input().value).toBe('');await type('버릴 초안');await click('초안 버리기');await click('메모 작성');expect(input().value).toBe('');expect(host.textContent).toContain('저장된 메모: 첫 메모');
});
it('assigns armed failure to the next submitted search, not an older response',async()=>{
 await render(LatestSearchWins);await tool('다음 검색 느리게');await click('검색');await tool('다음 검색 실패시키기');await wait(950);expect(host.textContent).toContain('검색 결과: 일기');await type('다음 검색');await click('검색');await wait(200);expect(host.textContent).toContain('검색하지 못했어요');
});
it('keeps the latest result after an older failure and focuses input when retry disappears',async()=>{
 await render(LatestSearchWins);await tool('다음 검색 실패시키기');await tool('다음 검색 느리게');await click('검색');await type('최신 검색');await click('검색');await wait(950);expect(host.textContent).toContain('검색 결과: 최신 검색');await tool('다음 검색 실패시키기');await click('검색');await wait(200);await type('아직 제출 안 한 검색어');page.getByRole('button',{name:'다시 검색',exact:true}).element().focus();await click('다시 검색');expect(document.activeElement).toBe(input());await wait(200);expect(host.textContent).toContain('검색 결과: 최신 검색');expect(input().value).toBe('아직 제출 안 한 검색어');
});
