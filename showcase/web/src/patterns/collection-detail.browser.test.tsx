import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { CollectionDetailPreview } from './collection-detail-preview';
import { collectionCopy as copy } from '../../../shared/collection-detail';
import { profileCopy } from '../../../shared/design-profile';
import '../../../../packages/react/src/styles.css';
let host:HTMLDivElement,root:Root;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');host.style.width='390px';document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const render=(empty=false)=>act(async()=>root.render(<CollectionDetailPreview empty={empty}/>));
const button=(label:string,scope:ParentNode=document)=>[...scope.querySelectorAll<HTMLButtonElement>('button')].find(n=>n.textContent===label||n.getAttribute('aria-label')===label)!;
const click=(label:string,scope:ParentNode=document)=>act(async()=>{const target=button(label,scope);target.focus();target.click();});
const field=(label:string)=>[...document.querySelectorAll('label')].find(n=>n.textContent===label)!.htmlFor;
const input=(label:string)=>document.getElementById(field(label)) as HTMLInputElement;
const fill=(label:string,value:string)=>act(async()=>{const target=input(label);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(target,value);target.dispatchEvent(new Event('input',{bubbles:true}));});
const settle=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,260));});
it('keeps each card draft separate across navigation and theme changes',async()=>{
 await render();await fill('산책 '+copy.note,'산책 초안');await fill('독서 '+copy.note,'독서 초안');await click(copy.next);await settle();await click(profileCopy.nextTheme,host);expect(input('산책 '+copy.note).value).toBe('산책 초안');expect(input('독서 '+copy.note).value).toBe('독서 초안');expect(input('휴식 '+copy.note).value).toBe(copy.initial);
});
it('keeps the open detail and its independent draft across theme changes and returns to its exact card action',async()=>{
 await render();await fill('독서 '+copy.note,'카드 초안');const trigger=button('독서 '+copy.open);await click('독서 '+copy.open);await settle();const dialog=document.querySelector('[role=dialog]')!;await fill('독서 '+copy.detailNote,'상세 초안');await click(profileCopy.nextTheme,dialog);expect(document.querySelector('[role=dialog]')).toBe(dialog);expect(input('독서 '+copy.detailNote).value).toBe('상세 초안');await click(copy.close,dialog);await settle();expect(document.activeElement).toBe(trigger);expect(input('독서 '+copy.note).value).toBe('카드 초안');await click('독서 '+copy.open);await settle();expect(input('독서 '+copy.detailNote).value).toBe('상세 초안');
});
it('opens a different detail without copying another record draft and Escape returns to that record',async()=>{
 await render();await click('산책 '+copy.open);await settle();await fill('산책 '+copy.detailNote,'산책 상세');await act(async()=>userEvent.keyboard('{Escape}'));await settle();expect(document.activeElement).toBe(button('산책 '+copy.open));await click('휴식 '+copy.open);await settle();expect(input('휴식 '+copy.detailNote).value).toBe(copy.initial);await act(async()=>userEvent.keyboard('{Escape}'));await settle();expect(document.activeElement).toBe(button('휴식 '+copy.open));
});
it('removes an open detail with an emptied collection and restores no stale modal when records return',async()=>{
 await render();await click('산책 '+copy.open);await settle();await render(true);await settle();expect(document.querySelector('[role=dialog]')).toBeNull();expect(host.textContent).toContain(copy.empty);expect(button(copy.next).getAttribute('aria-disabled')).toBe('true');expect(button(copy.previous).getAttribute('aria-disabled')).toBe('true');await render();await settle();expect(document.querySelector('[role=dialog]')).toBeNull();await click('산책 '+copy.open);await settle();expect(input('산책 '+copy.detailNote).value).toBe(copy.initial);
});
it('associates each memo label with its own input when two collections share a page',async()=>{
 await act(async()=>root.render(<><CollectionDetailPreview/><CollectionDetailPreview/></>));
 const labels=[...host.querySelectorAll('label')].filter(n=>n.textContent==='산책 '+copy.note);const secondLabel=labels[1]!;const ownInput=secondLabel.parentElement!.querySelector('input')!;
 await act(async()=>userEvent.click(secondLabel));expect(document.activeElement===ownInput).toBe(true);
});
