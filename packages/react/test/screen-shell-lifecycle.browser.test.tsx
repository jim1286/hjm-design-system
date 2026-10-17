import { act, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { HjmProvider } from "../src/provider.js";
import { Button } from "../src/actions.js";
import { NotificationInboxScreen, ScreenLayout, SettingsScreen } from "../src/screens.js";
import type { ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host=document.createElement('div');document.body.append(host);root=createRoot(host); });
afterEach(async () => { await act(async()=>root.unmount());host.remove(); });
async function render(ui:ReactNode) { await act(async()=>root.render(<HjmProvider reducedMotion><div style={{height:650,width:390}}>{ui}</div></HjmProvider>)); }
const body=()=>host.querySelector<HTMLElement>('.hjm-screen__body')!;
const button=(name:string)=>[...host.querySelectorAll('button')].find(n=>n.textContent===name)!;
it("keeps the inbox filter and notice actionable while centering each replacement in the remaining body",async()=>{
 const filter=vi.fn(),retry=vi.fn(); let first:HTMLButtonElement|undefined;
 for(const kind of ['loading','error','empty'] as const){
  await render(<NotificationInboxScreen title="Inbox" notice={kind === "error" ? <p>Reading changes were not saved</p> : null} filters={<Button onClick={filter}>Unread</Button>} footer={<Button>Compose</Button>} state={{kind,title:'State'}} stateAction={<Button onClick={retry}>Recover</Button>}><input aria-label="Hidden private content"/></NotificationInboxScreen>);
  const current=button('Unread'); if(first) { expect(current).toBe(first); expect(document.activeElement).toBe(first); } first=current;
  expect(host.querySelector('input')).toBeNull();expect(host.textContent?.includes('Reading changes were not saved')).toBe(kind === 'error');
  const state=host.querySelector<HTMLElement>('.hjm-screen__state')!.getBoundingClientRect(),bounds=body().getBoundingClientRect();
  expect(Math.abs((state.top+state.bottom)/2-(bounds.top+bounds.bottom)/2)).toBeLessThan(3);
  expect(Math.abs((state.left+state.right)/2-(bounds.left+bounds.right)/2)).toBeLessThan(3);
  current.focus();await act(async()=>current.click());expect(document.activeElement).toBe(current);
  await act(async()=>button('Recover').click()); current.focus();
 }
 expect(filter).toHaveBeenCalledTimes(3);expect(retry).toHaveBeenCalledTimes(3);
});
it("keeps settings draft, selection, focus and scroll through section reorder and refresh notice",async()=>{
 const section=(id:string)=>({id,title:id,children:id==='account'?<input aria-label="Nickname" defaultValue="saved"/>:<div style={{height:700}}>Preferences</div>});
 const ui=(reorder=false,notice?:string)=><SettingsScreen title="Settings" {...(notice?{notice}: {})} sections={reorder?[section('preferences'),section('account')]:[section('account'),section('preferences')]}/>;
 await render(ui());const input=host.querySelector('input')!;input.value='unsaved';input.focus();input.setSelectionRange(2,5);body().scrollTop=150;
 await render(ui(false,'Save failed'));expect(host.querySelector('input')).toBe(input);expect(input.value).toBe('unsaved');expect(document.activeElement).toBe(input);expect(body().scrollTop).toBe(150);
 await render(ui(true,'Save failed'));expect(host.querySelector('input')).toBe(input);expect(document.activeElement).toBe(input);expect(input.selectionStart).toBe(2);expect(input.selectionEnd).toBe(5);
});
it.each(["loading", "ready"] as const)("keeps keyboard focus in the screen after retry enters %s and removes its focused action",async(next)=>{
 function Example(){const[state,setState]=useState<ScreenContentState>({kind:'error',title:'Failed'});return <ScreenLayout title="Results" scroll="content" state={state} stateAction={state.kind==='error'?<Button onClick={()=>setState(next === 'ready' ? {kind:'ready'} : {kind:'loading',title:'Loading'})}>Retry</Button>:undefined}><button>Result</button></ScreenLayout>;}
 await render(<Example/>);button('Retry').focus();await act(async()=>button('Retry').click());expect(document.activeElement).toBe(body());expect(body().getAttribute('aria-busy')).toBe(next === 'loading' ? 'true' : null);
});
it("recovers removed content focus on restriction but never steals an external control",async()=>{
 const ui=(state:ScreenContentState)=><><button>Outside</button><ScreenLayout title="Private" scroll="content" state={state}><input aria-label="Private draft"/></ScreenLayout></>;
 await render(ui({kind:'ready'}));host.querySelector('input')!.focus();await render(ui({kind:'restricted',title:'Sign in'}));expect(document.activeElement).toBe(body());
 await render(ui({kind:'ready'}));host.querySelector('input')!.focus();button('Outside').focus();await render(ui({kind:'restricted',title:'Sign in'}));expect(document.activeElement).toBe(button('Outside'));
});

it.each(["blur", "outside click"] as const)("does not reclaim focus after an intentional %s to the document",async(method)=>{
 const ui=(state:ScreenContentState)=><><div data-outside style={{height:40}}>Outside space</div><ScreenLayout title="Private" state={state}><input aria-label="Private draft"/></ScreenLayout></>;
 await render(ui({kind:'ready'}));const input=host.querySelector('input')!;input.focus();
 if(method==='blur') await act(async()=>input.blur());
 else await act(async()=>userEvent.click(host.querySelector<HTMLElement>('[data-outside]')!));
 expect(document.activeElement).toBe(document.body);
 await render(ui({kind:'restricted',title:'Sign in'}));expect(document.activeElement).toBe(document.body);
});

it("hides a redundant page title while keeping its screen name and centered date",async()=>{
 host.style.width='400px';
 await render(<ScreenLayout title="Schedule route" titleVisibility="hidden" description="2026.10.14" exit={{kind:"back",label:"Back",onClick:()=>{}}} actions={<><button>Calendar</button><button>Search</button></>}><div>Games</div></ScreenLayout>);
 expect(host.querySelector('h1')).toBeNull();expect(host.querySelector('main')!.getAttribute('aria-label')).toBe('Schedule route');
 const header=host.querySelector<HTMLElement>('.hjm-screen__header')!.getBoundingClientRect(),context=host.querySelector<HTMLElement>('.hjm-screen__heading')!.getBoundingClientRect();
 expect(Math.abs((header.left+header.right)/2-(context.left+context.right)/2)).toBeLessThan(1);
 expect(host.querySelectorAll('button')).toHaveLength(3);
});
