import { act } from "react";
import { createRoot } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { expect, it } from "vitest";
import { RadioGroup, CheckboxGroup } from "../src/selection.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it.each(["light", "dark"] as const)("wraps nullable chip radios while preserving native keyboard selection in %s", async theme => {
  const host=document.createElement("div"); host.style.width="180px"; document.body.append(host); const root=createRoot(host);
  const items=Array.from({length:7},(_,index)=>({value:String(index),label:String(2026-index)}));
  try {
    await act(async()=>root.render(<HjmProvider theme={theme}><RadioGroup accessibilityLabel="Season" presentation="chips" size="small" defaultValue={null} items={items} renderLeading={()=><span>◆</span>}/></HjmProvider>));
    const radios=[...host.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    expect(radios.every(input=>!input.checked)).toBe(true);
    const first=radios[0]!.closest("label")!, last=radios.at(-1)!.closest("label")!;
    expect(last.getBoundingClientRect().top).toBeGreaterThan(first.getBoundingClientRect().top);
    expect(last.getBoundingClientRect().right).toBeLessThanOrEqual(host.getBoundingClientRect().right+1);
    await act(async()=>{radios[0]!.focus(); await userEvent.keyboard("{ArrowRight}");});
    expect(radios[1]!.checked).toBe(true); expect(radios.filter(input=>input.checked)).toHaveLength(1);
    const focused=host.querySelector('label:has(input:focus-visible)')!;
    expect(getComputedStyle(focused).outlineStyle).not.toBe("none");
    expect(getComputedStyle(focused.querySelector(".hjm-choice__leading")!).color).toBe(getComputedStyle(focused).color);
  } finally {await act(async()=>root.unmount());host.remove();}
});
it.each(["light", "dark"] as const)("retains multiple native checkbox values and read-only protection in %s", async theme=>{
  const host=document.createElement("div");document.body.append(host);const root=createRoot(host);
  const items=[{id:"2026",label:"2026"},{id:"2025",label:"2025"},{id:"2024",label:"2024",disabled:true}];
  const ui=(readOnly=false)=><HjmProvider theme={theme}><CheckboxGroup accessibilityLabel="Draft years" presentation="chips" size="small" items={items} readOnly={readOnly}/></HjmProvider>;
  try {
    await act(async()=>root.render(ui())); const boxes=[...host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
    await act(async()=>{boxes[0]!.click();boxes[1]!.click();});expect(boxes.map(input=>input.checked)).toEqual([true,true,false]);
    await act(async()=>boxes[0]!.click());expect(boxes.map(input=>input.checked)).toEqual([false,true,false]);expect(boxes[2]!.disabled).toBe(true);
    await act(async()=>root.render(ui(true)));await act(async()=>boxes[0]!.click());expect(boxes.map(input=>input.checked)).toEqual([false,true,false]);
  } finally {await act(async()=>root.unmount());host.remove();}
});
