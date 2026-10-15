import { expect, it } from "vitest";
import { resolveTaskChoice, resolvePasswordRules, resolvePriceOption, type PriceOption } from "../src/task-controls.js";
it("requires stable unique choices and an existing confirmed selection", () => {
 expect(resolveTaskChoice([{id:"a",label:"개인"}],"a").id).toBe("a");
 expect(()=>resolveTaskChoice([{id:"a",label:"A"},{id:"a",label:"B"}],"a")).toThrow();
 expect(()=>resolveTaskChoice([{id:"a",label:"A"}],"missing")).toThrow();
});
it("counts only supplied password requirements and stores neither password nor strength", () => {
 const rules=[{id:"length",label:"8자",test:(value:string)=>value.length>=8},{id:"number",label:"숫자",test:(value:string)=>/\d/.test(value)}];
 const state=resolvePasswordRules("abcdefgh",rules);expect(state.satisfied).toBe(1);expect(state.total).toBe(2);expect(state).not.toHaveProperty("value");expect(state).not.toHaveProperty("strength");
 expect(resolvePasswordRules("abcdefg1",rules).satisfied).toBe(2);expect(()=>resolvePasswordRules("",[])).toThrow();
});
it("preserves actual billing amounts and periods rather than manufacturing a monthly quote", () => {
 const prices:PriceOption[]=[{id:"month",label:"매월",amountMinor:9000,currency:"KRW",interval:"month",intervalCount:1,benefits:["기록"]},{id:"year",label:"매년",amountMinor:80000,currency:"KRW",interval:"year",intervalCount:1,benefits:["기록"]}];
 expect(resolvePriceOption(prices,"year").amountMinor).toBe(80000);expect(resolvePriceOption(prices,"year").interval).toBe("year");
 expect(()=>resolvePriceOption([{...prices[0]!,amountMinor:.5}],"month")).toThrow();
 expect(()=>resolvePriceOption([{...prices[0]!,intervalCount:0}],"month")).toThrow();
});
