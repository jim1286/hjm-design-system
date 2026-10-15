import {readTextAnswer} from "../../../showcase/shared/streaming-answer-example.js";
import {consumeAnswerStream} from "@hjmds/design-contracts/streaming-answer";
import{act}from "react";import{createRoot,type Root}from "react-dom/client";import{afterEach,beforeEach,expect,it,vi}from "vitest";import{StreamingAnswer}from "../src/streaming-answer.js";import{HjmProvider}from "../src/provider.js";import type{AnswerStreamEvent,AnswerGenerationContext}from "@hjmds/design-contracts/streaming-answer";import "../src/styles.css";
const labels={generate:"생성",regenerate:"다시 생성",stop:"중지",thinking:"생각 중",streaming:"응답 중",stopping:"중지 확인 중",complete:"응답 완료",stopped:"중지됨",error:"응답 실패"};let host:HTMLDivElement,root:Root;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement("div");host.style.width="375px";document.body.append(host);root=createRoot(host);});afterEach(async()=>{await act(async()=>root.unmount());host.remove();});const button=(name:string)=>[...host.querySelectorAll("button")].find(n=>n.textContent===name)!;
it("shows real thinking, consumes actual chunks, confirms stop and retains partial text",async()=>{
 let provide!:(s:AsyncIterable<AnswerStreamEvent>)=>void;const generate=vi.fn((context:AnswerGenerationContext)=>new Promise<AsyncIterable<AnswerStreamEvent>>(resolve=>{provide=resolve;signal=context.signal;}));let signal!:AbortSignal;
 await act(async()=>root.render(<HjmProvider><StreamingAnswer answerId="a" label="답변" labels={labels} onGenerate={generate}/></HjmProvider>));await act(async()=>{button("생성").click();button("생성").click();});expect(generate).toHaveBeenCalledOnce();expect(host.textContent).toContain("생각 중");
 async function* source():AsyncGenerator<AnswerStreamEvent>{yield{type:"delta",text:"실제 부분 응답"};await new Promise<void>((_,reject)=>signal.addEventListener("abort",()=>reject(Object.assign(new Error("abort"),{name:"AbortError"})),{once:true}));yield{type:"done"};}
 await act(async()=>provide(source()));expect(host.textContent).toContain("실제 부분 응답");await act(async()=>button("중지").click());expect(signal.aborted).toBe(true);expect(host.textContent).toContain("중지됨");expect(host.textContent).toContain("실제 부분 응답");
});
it("preserves earlier text during regeneration and a failed new request",async()=>{
 const generate=vi.fn().mockRejectedValue(new Error("offline"));await act(async()=>root.render(<HjmProvider><StreamingAnswer answerId="a" label="답변" labels={labels} initialText="보존할 답변" onGenerate={generate}/></HjmProvider>));await act(async()=>button("다시 생성").click());expect(generate.mock.calls[0]![0]).toMatchObject({previousText:"보존할 답변",regenerate:true});expect(host.querySelector('[role="alert"]')?.textContent).toBe("응답 실패");expect(host.textContent).toContain("보존할 답변");
});
it("never promotes a truncated provider stream to completed output",async()=>{
 async function* source():AsyncGenerator<AnswerStreamEvent>{yield{type:"delta",text:"중간 응답"};}
 await act(async()=>root.render(<HjmProvider><StreamingAnswer answerId="a" label="답변" labels={labels} onGenerate={()=>source()}/></HjmProvider>));await act(async()=>button("생성").click());expect(host.textContent).toContain("중간 응답");expect(host.textContent).toContain("응답 실패");expect(host.textContent).not.toContain("응답 완료");
});

it("decodes actual UTF-8 response bytes and waits for real transport completion",async()=>{
 const response=await fetch(new URL("./fixtures/streaming-answer.txt",import.meta.url)),signal=new AbortController().signal;const seen:string[]=[];
 const result=await consumeAnswerStream(readTextAnswer(response,{signal}),signal,"previous",text=>seen.push(text));expect(result.phase).toBe("complete");expect(result.text).toContain("실제 네트워크 스트림 검사\n두 번째 줄");expect(seen.at(-1)).toBe(result.text);
});
