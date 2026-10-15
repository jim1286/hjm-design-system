import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SplitAction, AccountSwitcher, PasswordRulesField, PricingChoice } from "../src/task-controls.js";
import { HjmProvider } from "../src/provider.js";
import { compositionBrandFixtures } from "../../../showcase/shared/composition-brand-fixtures.js";
import "../src/styles.css";
let host:HTMLDivElement,root:Root;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement("div");host.style.width="375px";document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const modes=[{id:"save",label:"저장"},{id:"publish",label:"게시"}];
const click=(name:string)=>act(async()=>page.getByRole("button",{name,exact:true}).click());
it("changes split mode without executing and preserves the chosen mode after real task failure",async()=>{
 let reject!:(reason:Error)=>void;const execute=vi.fn(()=>new Promise<void>((_,fail)=>{reject=fail;}));
 function Demo(){const [mode,setMode]=useState("save");return <SplitAction modes={modes} modeId={mode} onModeChange={setMode} onExecute={execute} executeLabel={m=>`${m.label} 실행`} menuLabel="실행 방식" dismissLabel="닫기" errorLabel="실행 실패"/>;}
 await act(async()=>root.render(<HjmProvider><Demo/></HjmProvider>));await click("실행 방식");
 await act(async()=>page.getByRole("menuitemradio",{name:"게시",exact:true}).click());expect(execute).not.toHaveBeenCalled();
 const button=[...host.querySelectorAll("button")].find(n=>n.textContent==="게시 실행")!;
 await act(async()=>{button.click();button.click();});expect(execute).toHaveBeenCalledOnce();expect(execute).toHaveBeenCalledWith("publish");
 await act(async()=>reject(new Error("offline")));expect(host.textContent).toContain("실행 실패");expect(host.textContent).toContain("게시 실행");
});
it("keeps the confirmed account while switching and restores an actionable menu after failure",async()=>{
 let reject!:(reason:Error)=>void;const change=vi.fn(()=>new Promise<void>((_,fail)=>{reject=fail;}));
 await act(async()=>root.render(<HjmProvider><AccountSwitcher accounts={[{id:"a",label:"개인"},{id:"b",label:"작업실"}]} accountId="a" label="계정 전환" dismissLabel="닫기" errorLabel="전환 실패" onSwitch={change}/></HjmProvider>));
 await click("계정 전환");await act(async()=>page.getByRole("menuitemradio",{name:"작업실",exact:true}).click());
 expect(change).toHaveBeenCalledWith("b");expect(host.textContent).toContain("개인");
 await act(async()=>reject(new Error("offline")));expect(host.textContent).toContain("전환 실패");await click("계정 전환");
 expect(document.querySelector('[role="menuitemradio"][aria-checked="true"]')?.textContent).toBe("개인");
});
it("uses the existing password reveal field and reports rule satisfaction without claiming strength",async()=>{
 function Demo(){const [value,setValue]=useState("");return <PasswordRulesField label="비밀번호" value={value} onValueChange={setValue} autofillHint="new" revealLabel="보기" concealLabel="숨기기" progressLabel="규칙 충족" summaryLabel={(n,total)=>`${n}/${total} 조건`} ruleLabel={r=>`${r.satisfied?"충족":"미충족"} ${r.label}`} rules={[{id:"length",label:"8자 이상",test:v=>v.length>=8},{id:"number",label:"숫자 포함",test:v=>/\d/.test(v)}]}/>;}
 await act(async()=>root.render(<HjmProvider><Demo/></HjmProvider>));
 await act(async()=>page.getByLabelText("비밀번호",{exact:true}).fill("abcdefg1"));expect(host.querySelector("progress")?.value).toBe(2);expect(host.textContent).toContain("충족 숫자 포함");
 await click("보기");expect(host.querySelector("input")?.type).toBe("text");expect(host.querySelector("input")?.value).toBe("abcdefg1");
});
it("presents actual billing periods and passes a frozen selected price to the real continuation",async()=>{
 const proceed=vi.fn().mockRejectedValue(new Error("offline"));
 function Demo(){const [id,setId]=useState("month");return <PricingChoice label="기록 요금" options={[{id:"month",label:"월간",amountMinor:9000,currency:"KRW",interval:"month",intervalCount:1,benefits:["월별 기록"]},{id:"year",label:"연간",amountMinor:80000,currency:"KRW",interval:"year",intervalCount:1,benefits:["연간 기록"]}]} selectedId={id} onSelectionChange={setId} formatPrice={p=>`${p.amountMinor} ${p.currency} / ${p.interval}`} continueLabel="선택 요금 계속" errorLabel="진행 실패" onContinue={proceed}/>;}
 await act(async()=>root.render(<HjmProvider><Demo/></HjmProvider>));await act(async()=>page.getByText("연간",{exact:true}).click());expect(proceed).not.toHaveBeenCalled();
 await click("선택 요금 계속");const price=proceed.mock.calls[0]![0];expect(price.amountMinor).toBe(80000);expect(price.interval).toBe("year");expect(Object.isFrozen(price.benefits)).toBe(true);expect(host.textContent).toContain("진행 실패");expect(host.querySelector<HTMLInputElement>('input[value="year"]')?.checked).toBe(true);
 expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth);
});

it("keeps all four controls within a narrow host across two product palettes and both themes",async()=>{
 for(const palette of Object.values(compositionBrandFixtures))for(const theme of ["light","dark"] as const){
 await act(async()=>root.render(<HjmProvider theme={theme} brandPalette={palette}>
 <SplitAction modes={modes} modeId="save" onModeChange={()=>undefined} onExecute={()=>undefined} executeLabel={m=>`${m.label} 실행`} menuLabel="방식" dismissLabel="닫기" errorLabel="실패"/>
 <AccountSwitcher accounts={[{id:"a",label:"개인"},{id:"b",label:"작업실"}]} accountId="a" label="계정" dismissLabel="닫기" errorLabel="실패" onSwitch={()=>undefined}/>
 <PasswordRulesField label="비밀번호" value="abc" onValueChange={()=>undefined} autofillHint="new" revealLabel="보기" concealLabel="숨기기" progressLabel="규칙" summaryLabel={(n,t)=>`${n}/${t}`} ruleLabel={r=>r.label} rules={[{id:"length",label:"8자 이상",test:v=>v.length>=8}]}/>
 <PricingChoice label="요금" options={[{id:"month",label:"매월",amountMinor:9000,currency:"KRW",interval:"month",intervalCount:1,benefits:["기록"]}]} selectedId="month" onSelectionChange={()=>undefined} formatPrice={p=>`${p.amountMinor}원 / 매월`} continueLabel="계속" errorLabel="실패" onContinue={()=>undefined}/>
 </HjmProvider>));
 const button=[...host.querySelectorAll("button")].find(n=>n.textContent==="저장 실행")!, hex=palette[theme].primary,rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 await expect.poll(()=>getComputedStyle(button).backgroundColor).toBe(`rgb(${rgb.join(", ")})`);expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth);
 }
});
