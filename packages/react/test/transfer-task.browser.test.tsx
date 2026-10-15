import {act} from "react";import {createRoot,type Root} from "react-dom/client";
import {afterEach,beforeEach,expect,it,vi} from "vitest";
import {TransferTask} from "../src/transfer-task.js";import {HjmProvider} from "../src/provider.js";
import type {TransferContext} from "@hjmds/design-contracts/transfer-task";
import {compositionBrandFixtures} from "../../../showcase/shared/composition-brand-fixtures.js";
import {receiveTransfer} from "../../../showcase/shared/transfer-task-example.js";
import "../src/styles.css";
const labels={start:"전송",queued:"대기",transferring:"전송 중",cancel:"취소",cancelling:"취소 요청 중",cancelled:"취소됨",success:"전송 완료",error:"전송 실패"};
const format=(p:{completed:number;total:number|null})=>`${p.completed}/${p.total??"미정"}`;
let host:HTMLDivElement,root:Root;beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement("div");host.style.width="375px";document.body.append(host);root=createRoot(host);});afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const button=(name:string)=>[...host.querySelectorAll("button")].find(n=>n.textContent===name)!;
it("uses one progress host from real queue through unknown and learned totals, never a success timer",async()=>{
 let context!:TransferContext,done!:()=>void;const run=vi.fn((c:TransferContext)=>{context=c;return new Promise<void>(resolve=>{done=resolve;});});
 await act(async()=>root.render(<HjmProvider><TransferTask labels={labels} formatProgress={format} onTransfer={run}/></HjmProvider>));await act(async()=>{button("전송").click();button("전송").click();});expect(run).toHaveBeenCalledOnce();
 const progress=host.querySelector("progress")!;expect(progress.hasAttribute("value")).toBe(false);
 await act(async()=>context.report({completed:12,total:null}));expect(progress.hasAttribute("value")).toBe(false);
 await act(async()=>context.report({completed:12,total:100}));expect(host.querySelector("progress")).toBe(progress);expect(progress.value).toBe(12);expect(progress.max).toBe(100);expect(host.textContent).not.toContain("전송 완료");
 await act(async()=>context.report({completed:100,total:100}));expect(host.textContent).not.toContain("전송 완료");await act(async()=>done());expect(host.textContent).toContain("전송 완료");expect(document.getElementById(progress.getAttribute("aria-labelledby")!)?.textContent).toBe("전송 완료");expect(host.textContent).not.toContain("전송 중");
 await act(async()=>context.report({completed:999,total:null}));expect(progress.value).toBe(100);
});
it("waits for real abort confirmation and keeps partial progress and retry",async()=>{
 let context!:TransferContext,fail!:(error:Error)=>void;
 await act(async()=>root.render(<HjmProvider><TransferTask labels={labels} formatProgress={format} onTransfer={c=>{context=c;return new Promise<void>((_,reject)=>{fail=reject;});}}/></HjmProvider>));await act(async()=>button("전송").click());await act(async()=>context.report({completed:20,total:100}));
 await act(async()=>button("취소").click());expect(context.signal.aborted).toBe(true);expect(host.textContent).toContain("취소 요청 중");expect(host.textContent).not.toContain("취소됨");
 await act(async()=>fail(Object.assign(new Error("aborted"),{name:"AbortError"})));expect(host.textContent).toContain("취소됨");expect(host.querySelector("progress")!.value).toBe(20);expect(button("전송").getAttribute("aria-busy")).toBeNull();
});
it("keeps a real completion authoritative if it wins the cancel race",async()=>{
 let done!:()=>void;await act(async()=>root.render(<HjmProvider><TransferTask labels={labels} formatProgress={format} onTransfer={()=>new Promise<void>(resolve=>{done=resolve;})}/></HjmProvider>));await act(async()=>button("전송").click());await act(async()=>button("취소").click());await act(async()=>done());expect(host.textContent).toContain("전송 완료");expect(host.textContent).not.toContain("취소됨");expect(host.querySelector("progress")).toBeNull();
});
it("preserves error observations and inherits two palettes at a narrow width in both themes",async()=>{
 for(const palette of Object.values(compositionBrandFixtures))for(const theme of ["light","dark"] as const){
 await act(async()=>root.render(<HjmProvider theme={theme} brandPalette={palette}><TransferTask key={theme+palette.light.primary} labels={labels} formatProgress={format} onTransfer={async c=>{c.report({completed:30,total:100});throw new Error("offline");}}/></HjmProvider>));
 await act(async()=>button("전송").click());expect(host.querySelector('[role="alert"]')?.textContent).toBe("전송 실패");expect(host.querySelector("progress")!.value).toBe(30);expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth);
 }
});

it("reads actual response stream bytes and confirms only its real end",async()=>{
 const observations:{completed:number;total:number|null}[]=[];const c=new AbortController();const response=await fetch(new URL("../../../showcase/shared/assets/reference-video/preview.mp4",import.meta.url));
 await receiveTransfer(response,{signal:c.signal,report:p=>observations.push(p)});expect(observations.at(-1)!.completed).toBeGreaterThan(1000);expect(observations[0]!.completed).toBe(0);if(observations.at(-1)!.total!==null)expect(observations.at(-1)!.completed).toBe(observations.at(-1)!.total);
});
