import { act,type ReactNode } from 'react';
import { createRoot,type Root } from 'react-dom/client';
import { afterEach,beforeEach,expect,it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { HjmProvider } from '@hjmds/react/provider';
import { OriginDialogPreview,OriginPopoverPreview } from './origin-dialog-preview';
import '../../../../packages/react/src/styles.css';
let host:HTMLDivElement,root:Root;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const render=(ui:ReactNode)=>act(async()=>root.render(<HjmProvider reducedMotion>{ui}<button data-external style={{ position: 'fixed', right: 20, bottom: 20 }}>다른 작업</button></HjmProvider>));
const button=(label:string)=>[...document.querySelectorAll<HTMLButtonElement>('button')].find(n=>n.textContent===label||n.getAttribute('aria-label')===label)!;
const click=(label:string)=>act(async()=>{const target=button(label);target.focus();target.click();});
const input=()=>document.querySelector<HTMLInputElement>('input')!;
const fill=(value:string)=>act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input(),value);input().dispatchEvent(new Event('input',{bubbles:true}));});
const settle=()=>act(async()=>{await new Promise(r=>setTimeout(r,90));});
for(const [name,Preview] of [['dialog',OriginDialogPreview],['popover',OriginPopoverPreview]] as const){
 it(`retains ${name} draft through failure and closing, then saves from the reopened editor and returns to its opener`,async()=>{
  await render(<Preview/>);await click('다음 저장 실패시키기');await click('메모 편집');await fill('수정한 여행 메모');await click('저장');expect(document.body.textContent).toContain('저장하지 못했어요.');expect(input().value).toBe('수정한 여행 메모');await click('편집 닫기');await settle();expect(document.activeElement).toBe(button('메모 편집'));await click('메모 편집');expect(input().value).toBe('수정한 여행 메모');await click('저장');await settle();expect(document.querySelector('input')).toBeNull();expect(document.activeElement).toBe(button('메모 편집'));expect(host.querySelector('[role=status]')?.textContent).toContain('수정한 여행 메모');
 });
 it(`reports an intentionally emptied ${name} memo as a confirmed save`,async()=>{
  await render(<Preview/>);await click('메모 편집');await fill('');await click('저장');await settle();expect(host.querySelector('[role=status]')?.textContent).toBe('빈 메모를 저장했어요.');
 });
}
it('preserves the actual outside-click destination while keeping the contextual draft for reopening',async()=>{
 await render(<OriginPopoverPreview/>);const external=host.querySelector<HTMLButtonElement>('[data-external]')!;
 // Compare native pointer behavior: WebKit may leave focus on body for a plain button.
 await userEvent.click(external);const outsideDestination=document.activeElement;
 await click('메모 편집');await fill('나중에 저장할 초안');await act(async()=>userEvent.click(external));await settle();expect(document.activeElement).toBe(outsideDestination);expect(document.querySelector('input')).toBeNull();await click('메모 편집');expect(input().value).toBe('나중에 저장할 초안');
});
