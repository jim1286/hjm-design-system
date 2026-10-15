import {act,create,type ReactTestRenderer} from "react-test-renderer";import {afterEach,expect,it,vi} from "vitest";
import {TransferTask} from "../src/transfer-task.js";import {HjmNativeProvider} from "../src/provider.js";import {Button} from "../src/actions.js";import {Progress} from "../src/feedback.js";import type{TransferContext}from "@hjmds/design-contracts/transfer-task";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
const labels={start:"전송",queued:"대기",transferring:"전송 중",cancel:"취소",cancelling:"취소 요청 중",cancelled:"취소됨",success:"완료",error:"실패"};let tree:ReactTestRenderer|undefined;afterEach(()=>{if(tree)act(()=>tree!.unmount());tree=undefined;});const button=(name:string)=>tree!.root.findAllByType(Button).find(n=>n.props.children===name)!;
it("drives the same native Progress from actual reports and serializes requests",async()=>{
 let context!:TransferContext,done!:()=>void;const run=vi.fn((c:TransferContext)=>{context=c;return new Promise<void>(resolve=>{done=resolve;});});act(()=>{tree=create(<HjmNativeProvider><TransferTask labels={labels} formatProgress={p=>String(p.completed)} onTransfer={run}/></HjmNativeProvider>);});
 act(()=>{button("전송").props.onPress();button("전송").props.onPress();});expect(run).toHaveBeenCalledOnce();const host=tree!.root.findByType(Progress);expect(host.props.value).toBeUndefined();act(()=>context.report({completed:5,total:20}));expect(tree!.root.findByType(Progress)).toBe(host);expect(host.props.value).toBe(5);await act(async()=>done());expect(button("전송").props.loading).toBe(false);expect(host.props.label).toBe("완료");
});
it("only confirms cancellation after the actual task rejects and aborts on unmount",async()=>{
 let context!:TransferContext,reject!:(e:Error)=>void;act(()=>{tree=create(<HjmNativeProvider><TransferTask labels={labels} formatProgress={p=>String(p.completed)} onTransfer={c=>{context=c;return new Promise<void>((_,fail)=>{reject=fail;});}}/></HjmNativeProvider>);});
 act(()=>button("전송").props.onPress());act(()=>button("취소").props.onPress());expect(context.signal.aborted).toBe(true);expect(button("전송").props.loading).toBe(true);await act(async()=>reject(Object.assign(new Error("aborted"),{name:"AbortError"})));expect(button("전송").props.loading).toBe(false);
 act(()=>button("전송").props.onPress());const signal=context.signal;act(()=>tree!.unmount());tree=undefined;expect(signal.aborted).toBe(true);await act(async()=>reject(Object.assign(new Error("aborted"),{name:"AbortError"})));
});
