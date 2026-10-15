import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { SplitAction, AccountSwitcher, PasswordRulesField, PricingChoice } from "../src/task-controls.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Menu } from "../src/navigation.js";
import { Button } from "../src/actions.js";
import { PasswordField, RadioGroup } from "../src/inputs.js";
import { Progress } from "../src/feedback.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer|undefined;
afterEach(()=>{if(tree)act(()=>tree!.unmount());tree=undefined;});
const button=(label:string)=>tree!.root.findAllByType(Button).find(n=>n.props.children===label)!;
it("serializes split execution, keeps mode selection separate and preserves failure",async()=>{
 let fail!:(reason:Error)=>void;const execute=vi.fn(()=>new Promise<void>((_,reject)=>{fail=reject;})), choose=vi.fn();
 act(()=>{tree=create(<HjmNativeProvider><SplitAction modes={[{id:"a",label:"보관"},{id:"b",label:"게시"}]} modeId="a" onModeChange={choose} onExecute={execute} executeLabel={m=>m.label} menuLabel="방식" dismissLabel="닫기" errorLabel="실행 실패"/></HjmNativeProvider>);});
 act(()=>tree!.root.findByType(Menu).props.onSelectionAfterDismiss("b"));expect(choose).toHaveBeenCalledWith("b");expect(execute).not.toHaveBeenCalled();
 act(()=>{button("보관").props.onPress();button("보관").props.onPress();});expect(execute).toHaveBeenCalledOnce();await act(async()=>fail(new Error("offline")));
 expect(tree!.root.findAll(n=>n.props.accessibilityRole==="alert").length).toBeGreaterThan(0);
});
it("keeps the confirmed account selected through a failed real session callback",async()=>{
 const change=vi.fn().mockRejectedValue(new Error("offline"));
 act(()=>{tree=create(<HjmNativeProvider><AccountSwitcher accounts={[{id:"a",label:"개인"},{id:"b",label:"작업실"}]} accountId="a" label="계정" dismissLabel="닫기" errorLabel="전환 실패" onSwitch={change}/></HjmNativeProvider>);});
 await act(async()=>tree!.root.findByType(Menu).props.onSelectionAfterDismiss("b"));expect(change).toHaveBeenCalledWith("b");expect(tree!.root.findByType(Menu).props.selection.selectedKey).toBe("a");
});
it("reuses PasswordField and passes the supplied satisfaction count to Progress",()=>{
 const update=vi.fn();act(()=>{tree=create(<HjmNativeProvider><PasswordRulesField label="비밀번호" value="abc" onValueChange={update} autofillHint="new" revealLabel="보기" concealLabel="숨기기" progressLabel="규칙" summaryLabel={(n,total)=>`${n}/${total}`} ruleLabel={r=>r.label} rules={[{id:"length",label:"8자",test:v=>v.length>=8}]}/></HjmNativeProvider>);});
 expect(tree!.root.findByType(Progress).props.value).toBe(0);expect(tree!.root.findByType(PasswordField).props.value).toBe("abc");
});
it("continues with the actual selected annual product without initiating checkout on radio selection",async()=>{
 const choose=vi.fn(),proceed=vi.fn();const price={id:"year",label:"연간",amountMinor:80000,currency:"KRW",interval:"year" as const,intervalCount:1,benefits:["기록"]};
 act(()=>{tree=create(<HjmNativeProvider><PricingChoice label="요금" options={[price]} selectedId="year" onSelectionChange={choose} formatPrice={p=>String(p.amountMinor)} continueLabel="계속" errorLabel="실패" onContinue={proceed}/></HjmNativeProvider>);});
 act(()=>tree!.root.findByType(RadioGroup).props.onValueChange("year"));expect(proceed).not.toHaveBeenCalled();await act(async()=>button("계속").props.onPress());expect(proceed).toHaveBeenCalledWith(price);expect(Object.isFrozen(proceed.mock.calls[0]![0].benefits)).toBe(true);
});
