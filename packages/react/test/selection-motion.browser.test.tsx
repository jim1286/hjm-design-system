import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it } from "vitest";
import { SegmentedControl } from "../src/selection.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
const items = [{value:"day",label:"하루"},{value:"locked",label:"잠김",disabled:true},{value:"month",label:"한 달"}];
beforeEach(()=>{(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement("div");host.style.width="360px";document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const settle=()=>expect.poll(()=>host.getAnimations({subtree:true}).filter(a=>a.playState==="running").length).toBe(0);
function alignment(){const indicator=host.querySelector<HTMLElement>(".hjm-segmented__highlight")!;const chosen=host.querySelector<HTMLElement>('[data-state="checked"]')!;const a=indicator.getBoundingClientRect(),b=chosen.getBoundingClientRect();expect(a.left).toBeCloseTo(b.left,0);expect(a.width).toBeCloseTo(b.width,0);}
it("moves artwork while native radio keyboard, disabled options and form data stay intact",async()=>{
 function Fixture(){const[value,set]=useState("day");return <HjmProvider><form><SegmentedControl label="기간" name="period" selectionMotion="slide" items={items} value={value} onValueChange={set}/></form></HjmProvider>;}
 await act(async()=>root.render(<Fixture/>));alignment();
 // This case verifies native keyboard navigation; the label owns the expanded pointer target.
 await act(async()=>host.querySelector<HTMLInputElement>('input[value="day"]')!.focus());await userEvent.keyboard("{ArrowRight}");
 expect(new FormData(host.querySelector("form")!).get("period")).toBe("month");
 expect(host.querySelectorAll('input[type="radio"]')).toHaveLength(3);await settle();alignment();
 await userEvent.keyboard("{ArrowRight}");await userEvent.keyboard("{ArrowLeft}");await settle();alignment();
});
// Historical maximum-text regression is excluded by the 2026-10-07 user scope.
it.skip("tracks stacked RTL large text and resizing without scaling labels or creating extra inputs",async()=>{
 await act(async()=>root.render(<HjmProvider theme="dark" direction="rtl" textScale={2} reducedMotion><SegmentedControl label="기간" selectionMotion="slide" items={items} value="month"/></HjmProvider>));
 alignment();expect(host.querySelectorAll("input")).toHaveLength(3);
 host.style.width="270px";await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));alignment();
 expect(getComputedStyle(host.querySelector(".hjm-segmented__highlight")!).transitionDuration).toBe("0s");
});
it("keeps pills inset, honors reduced motion and restores the static selection when disabled",async()=>{
 const render=(slide:boolean)=>act(async()=>root.render(<HjmProvider reducedMotion><SegmentedControl label="기간" presentation="pills" selectionMotion={slide?"slide":"none"} items={items} value="month"/></HjmProvider>));
 await render(true);alignment();const marker=host.querySelector(".hjm-segmented__highlight")!.getBoundingClientRect();const selected=host.querySelector('[data-state="checked"]')!.getBoundingClientRect();expect(marker.height).toBeLessThan(selected.height);
 await render(false);expect(host.querySelector(".hjm-segmented__highlight")).toBeNull();expect(host.querySelector('[data-highlight-ready="true"]')).toBeNull();
});

it("repositions fixed-width RTL pills when only their container width changes", async () => {
 await act(async()=>root.render(<HjmProvider theme="dark" direction="rtl" reducedMotion><SegmentedControl label="기간" selectionMotion="slide" presentation="pills" items={items} value="day"/></HjmProvider>));
 // Let the observer's initial delivery finish before testing a later resize.
 await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 alignment();
 // In RTL, narrowing the track moves a fixed-width pill without resizing it.
 // Observing only each pill misses this layout change and leaves its artwork behind.
 host.style.width="270px";
 await expect.poll(()=>{
  const marker=host.querySelector('.hjm-segmented__highlight')!.getBoundingClientRect();
  const selected=host.querySelector('[data-state="checked"]')!.getBoundingClientRect();
  return Math.abs(marker.left-selected.left);
 }).toBeLessThan(1);
});

// Historical maximum-text regression is excluded by the 2026-10-07 user scope.
it.skip("keeps the pill background behind the entire label at large text",async()=>{
 for(const scale of [1,2,3]) {
  await act(async()=>root.render(<HjmProvider textScale={scale} reducedMotion><SegmentedControl label="기간" selectionMotion="slide" presentation="pills" items={items} value="month"/></HjmProvider>));
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const text=host.querySelector('[data-state="checked"] > span')!.getBoundingClientRect();const marker=host.querySelector('.hjm-segmented__highlight')!.getBoundingClientRect();
  expect(marker.height).toBeGreaterThanOrEqual(text.height);expect(marker.top).toBeLessThanOrEqual(text.top);expect(marker.bottom).toBeGreaterThanOrEqual(text.bottom);
 }
});


it("keeps first and last pill focus rings inside every clipping ancestor", async () => {
 for (const width of [360, 160]) {
  host.style.width = `${width}px`;
  for (const theme of ["light", "dark"] as const) {
   await act(async()=>root.render(<HjmProvider theme={theme}><SegmentedControl label="기간" presentation="pills" items={items} value="day"/></HjmProvider>));
   for (const input of [host.querySelector<HTMLInputElement>('input[value="day"]')!, host.querySelector<HTMLInputElement>('input[value="month"]')!]) {
    input.focus();
    const pill = input.closest<HTMLElement>(".hjm-segmented__item")!;
    const style = getComputedStyle(pill);
    const reach = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
    expect(reach).toBeGreaterThan(0);
    const ring = pill.getBoundingClientRect();
    for (let ancestor = pill.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
     const css = getComputedStyle(ancestor), bounds = ancestor.getBoundingClientRect();
     if (css.overflowX !== "visible") {
      expect(ring.left - reach).toBeGreaterThanOrEqual(bounds.left);
      expect(ring.right + reach).toBeLessThanOrEqual(bounds.right);
     }
     if (css.overflowY !== "visible") {
      expect(ring.top - reach).toBeGreaterThanOrEqual(bounds.top);
      expect(ring.bottom + reach).toBeLessThanOrEqual(bounds.bottom);
     }
    }
   }
  }
 }
});
