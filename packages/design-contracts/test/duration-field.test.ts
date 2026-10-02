import { expect, it } from "vitest";
import { resolveDuration, changeDurationUnit } from "../src/duration-field.js";
it("splits integer seconds and clamps the combined duration at product boundaries",()=>{
  expect(resolveDuration(3661,{max:7200})).toMatchObject({hours:1,minutes:1,seconds:1});
  expect(changeDurationUnit(1490,'minutes',25,{max:1500})).toBe(1500);
  expect(changeDurationUnit(80,'minutes',null,{min:60,max:1500})).toBe(60);
  expect(()=>changeDurationUnit(60,'minutes',60,{max:7200})).toThrow();
  expect(()=>resolveDuration(1.5,{max:7200})).toThrow();
  expect(()=>resolveDuration(0,{max:0})).toThrow();
});
