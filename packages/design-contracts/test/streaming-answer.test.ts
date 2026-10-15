import {expect,it}from "vitest";import{consumeAnswerStream,type AnswerStreamEvent}from "../src/streaming-answer.js";
it("consumes provider deltas and completes only on the real provider done event",async()=>{
 const parts:string[]=[];async function* source():AsyncGenerator<AnswerStreamEvent>{yield{type:"delta",text:"새"};yield{type:"delta",text:" 답변"};yield{type:"done"};}
 const result=await consumeAnswerStream(source(),new AbortController().signal,"이전 답변",s=>parts.push(s));expect(parts).toEqual(["새","새 답변"]);expect(result).toEqual({phase:"complete",text:"새 답변"});
});
it("preserves partial deltas on a failed/incomplete provider stream",async()=>{
 const parts:string[]=[];async function* source():AsyncGenerator<AnswerStreamEvent>{yield{type:"delta",text:"부분"};}
 await expect(consumeAnswerStream(source(),new AbortController().signal,"",s=>parts.push(s))).rejects.toThrow("completion event");expect(parts).toEqual(["부분"]);
});
it("closes an aborted provider stream without fabricating further text",async()=>{
 const c=new AbortController();let closed=false;async function* source():AsyncGenerator<AnswerStreamEvent>{try{yield{type:"delta",text:"보존"};yield{type:"delta",text:"삭제"};yield{type:"done"};}finally{closed=true;}}
 const result=await consumeAnswerStream(source(),c.signal,"",()=>c.abort());expect(result).toEqual({phase:"stopped",text:"보존"});expect(closed).toBe(true);
});

it("confirms an actually empty regenerated answer instead of reusing the previous text",async()=>{
 async function* source():AsyncGenerator<AnswerStreamEvent>{yield{type:"done"};}
 expect(await consumeAnswerStream(source(),new AbortController().signal,"old answer",()=>undefined)).toEqual({phase:"complete",text:""});
});
it("waits for finally-yield cleanup before confirming stopped",async()=>{
 const controller=new AbortController();let cleaned=false;
 async function* source():AsyncGenerator<AnswerStreamEvent>{try{yield{type:"delta",text:"partial"};yield{type:"delta",text:"unused"};}finally{yield{type:"delta",text:"cleanup event"};cleaned=true;}}
 const result=await consumeAnswerStream(source(),controller.signal,"",()=>controller.abort());expect(cleaned).toBe(true);expect(result).toEqual({phase:"stopped",text:"partial"});
});
