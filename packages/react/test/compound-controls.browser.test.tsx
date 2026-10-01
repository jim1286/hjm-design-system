import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { InlineConfirm } from "../src/inline-confirm.js";
import { DurationField } from "../src/duration-field.js";
import { HjmProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT=true;
const copy={label:'Delete',prompt:'Delete draft?',confirmLabel:'Confirm',cancelLabel:'Cancel',pendingLabel:'Deleting',successLabel:'Deleted',errorLabel:'Try again'};
it("requires explicit confirmation, returns cancel focus and deduplicates a failing/retried action",async()=>{
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
 let finish!:()=>void;let fail!:(error:Error)=>void;
 const action=vi.fn(()=>new Promise<void>((resolve,reject)=>{finish=resolve;fail=reject;}));
 const button=(label:string)=>[...host.querySelectorAll('button')].find(b=>b.textContent===label)!;
 try{
  await act(()=>root.render(<HjmProvider><InlineConfirm {...copy} onConfirm={action}/></HjmProvider>));
  await act(()=>button('Delete').click());expect(action).not.toHaveBeenCalled();expect(document.activeElement).toBe(button('Cancel'));
  await act(()=>button('Cancel').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));
  expect(document.activeElement).toBe(button('Delete'));
  await act(()=>button('Delete').click());
  await act(()=>{const confirm=button('Confirm');confirm.click();confirm.click();});expect(action).toHaveBeenCalledTimes(1);
  expect(button('Cancel').disabled).toBe(true);
  await act(async()=>{fail(new Error('private error detail'));await Promise.resolve();});expect(host.querySelector('[role="alert"]')!.textContent).toBe('Try again');
  await act(()=>button('Confirm').click());expect(action).toHaveBeenCalledTimes(2);
  await act(async()=>{finish();await Promise.resolve();});expect(host.querySelector('[role="status"]')!.textContent).toBe('Deleted');
 }finally{await act(()=>root.unmount());host.remove();}
});
it("composes existing number steppers while respecting the total limit",async()=>{
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
 function Demo(){const [value,setValue]=useState(1490);return <><DurationField value={value} onValueChange={setValue} max={1500} labels={{label:'Duration',hours:'Hours',minutes:'Minutes',seconds:'Seconds',increment:u=>`${u}+`,decrement:u=>`${u}-`}}/><output>{value}</output></>;}
 try{await act(()=>root.render(<HjmProvider><Demo/></HjmProvider>));await act(()=>host.querySelector<HTMLButtonElement>('[aria-label="minutes+"]')!.click());expect(host.querySelector('output')!.textContent).toBe('1500');}
 finally{await act(()=>root.unmount());host.remove();}
});

import { ReactionPicker } from '../src/reaction-picker.js';
import { NotificationBell } from '../src/notification-bell.js';
it('keeps reactions controlled and notification pulses bounded by motion preferences',async()=>{
 const host=document.createElement('div');host.style.cssText='display:flex;flex-direction:column;width:500px';document.body.append(host);const root=createRoot(host);const change=vi.fn();const press=vi.fn();
 const animate=vi.spyOn(Element.prototype,'animate');
 const options=[{id:'like',emoji:'👍',label:'Like, 4 reactions',count:4},{id:'off',emoji:'✨',label:'Unavailable',disabled:true}];
 const render=(count:number,reducedMotion=false,value:string|null=null)=><HjmProvider reducedMotion={reducedMotion}><ReactionPicker label="Reactions" options={options} value={value} onValueChange={change}/><NotificationBell label={`${count} unread`} count={count} icon={<span>Bell</span>} onPress={press}/></HjmProvider>;
 try{
  await act(()=>root.render(render(0)));expect(animate).not.toHaveBeenCalled();expect(host.querySelector('[aria-label="0 unread"]')!.parentElement!.getBoundingClientRect().width).toBeLessThan(100);
  await act(()=>host.querySelector<HTMLButtonElement>('[aria-label="Like, 4 reactions"]')!.click());expect(change).toHaveBeenLastCalledWith('like');expect(host.textContent).toContain('4');
  await act(()=>root.render(render(1,false,'like')));expect(animate).toHaveBeenCalledTimes(1);
  await act(()=>host.querySelector<HTMLButtonElement>('[aria-label="Like, 4 reactions"]')!.click());expect(change).toHaveBeenLastCalledWith(null);
  await act(()=>host.querySelector<HTMLButtonElement>('[aria-label="Unavailable"]')!.click());expect(change).toHaveBeenCalledTimes(2);
  await act(()=>root.render(render(2,true)));expect(animate).toHaveBeenCalledTimes(1);
  await act(()=>host.querySelector<HTMLButtonElement>('[aria-label="2 unread"]')!.click());expect(press).toHaveBeenCalledTimes(1);
 }finally{await act(()=>root.unmount());host.remove();animate.mockRestore();}
});
