import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { SearchScreen } from "../src/screen-flows.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

it("keeps embedded query pinned while results scroll, without a second screen, and centers replacement states", async () => {
 const host=document.createElement('div');document.body.append(host);
 const root=createRoot(host);(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
 // Like a Sheet body, the bounded flex host sits inside the Provider; sizing the Provider root tests another boundary.
 const view=(empty:boolean,summaryEmpty=false)=><HjmProvider><div style={{height:600,width:390,display:"flex",flexDirection:"column"}}><SearchScreen embedded title="Search" queryLabel="Query" queryClearLabel="Clear" query="query"
   onQueryChange={()=>{}} onSearch={()=>{}} state={empty?{kind:'empty',title:'Nothing found'}:{kind:'ready'}}
   {...(summaryEmpty?{resultSummary:{count:0,countVisibility:"hidden" as const,countLabel:(n:number)=>`${n} results`,loadingLabel:'Loading',empty:{title:'No matches'}}}:{})}>
   {summaryEmpty?null:<div>{Array.from({length:40},(_,i)=><button key={i} style={{display:"block",height:44}}>Result {i}</button>)}</div>}</SearchScreen></div></HjmProvider>;
 try{
  await act(async()=>root.render(view(false)));
  expect(host.querySelector('main')).toBeNull();
  const input=host.querySelector('input')!,results=host.querySelector<HTMLElement>('.hjm-search-screen__results')!;
  expect(results.clientHeight).toBeGreaterThan(100);expect(results.scrollHeight).toBeGreaterThan(results.clientHeight);
  const top=input.getBoundingClientRect().top;results.scrollTop=500;
  expect(results.scrollTop).toBe(500);expect(input.getBoundingClientRect().top).toBe(top);
  await act(async()=>root.render(view(true)));
  const state=host.querySelector('[role="status"]')!,group=state.parentElement!;
  const copy=state.getBoundingClientRect(),bounds=group.getBoundingClientRect();
  expect(bounds.height).toBeGreaterThan(100);
  expect(Math.abs(copy.top+copy.height/2-bounds.top-bounds.height/2)).toBeLessThan(2);
  await act(async()=>root.render(view(false,true)));
  const summary=host.querySelector('.hjm-empty-state__title')!.getBoundingClientRect();
  const resultsBounds=host.querySelector('.hjm-search-screen__results')!.getBoundingClientRect();
  expect(Math.abs(summary.top+summary.height/2-resultsBounds.top-resultsBounds.height/2)).toBeLessThan(2);
 }finally{await act(async()=>root.unmount());host.remove();}
});
