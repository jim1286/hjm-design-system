import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LoadMore } from "../src/supplemental-navigation.js";
import { HjmProvider } from "../src/provider.js";
let host:HTMLDivElement,root:Root;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement("div");document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.unstubAllGlobals();});
const labels={loadMore:"More",loading:"Loading",retry:"Retry",complete:"Done"};
it.each([false,true])("does not notify a retired footer after unmount (failure=%s)",async failure=>{
 let resolve!:()=>void,reject!:(error:Error)=>void; const pending=new Promise<void>((yes,no)=>{resolve=yes;reject=no;});
 const outcome=vi.fn(),error=vi.fn();
 await act(async()=>root.render(<HjmProvider><LoadMore mode="manual" descriptor={{state:{status:"ready",requestKey:"a"},labels}} onLoadMore={()=>pending} onRequestOutcome={outcome} onRequestError={error}/></HjmProvider>));
 await act(async()=>host.querySelector("button")!.click());
 await act(async()=>root.render(null));
 await act(async()=>{failure?reject(new Error("late")):resolve();await Promise.resolve();});
 expect(outcome).not.toHaveBeenCalled();expect(error).not.toHaveBeenCalled();
});
it("ignores queued observer callbacks after the footer unmounts",async()=>{
 let notify!:IntersectionObserverCallback;const error=vi.fn(),load=vi.fn(async()=>{});
 vi.stubGlobal("IntersectionObserver",class{constructor(cb:IntersectionObserverCallback){notify=cb;}observe(){}disconnect(){}});
 await act(async()=>root.render(<HjmProvider><LoadMore descriptor={{state:{status:"ready",requestKey:"a"},labels}} onLoadMore={load} onRequestError={error}/></HjmProvider>));
 await act(async()=>root.render(null));
 await act(async()=>notify([{isIntersecting:true} as IntersectionObserverEntry],{} as IntersectionObserver));
 expect(load).not.toHaveBeenCalled();expect(error).not.toHaveBeenCalled();
});
