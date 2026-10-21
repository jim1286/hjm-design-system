import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { Steps } from "../src/steps.js";
import "../src/styles.css";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT = true;
it("insets terminal markers and keeps them readable at narrow and wide widths", async () => {
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  try {
    for (const width of [350, 1160]) {
      host.style.width = `${width}px`;
      for (const count of [4, 5]) {
        await act(async () => root.render(<HjmProvider><Steps
          descriptor={{steps:Array.from({length:count},(_,i)=>({id:String(i),label:i===count-1 ? "변경과 검증" : "단계"})),currentStepId:"1"}}
          statusLabels={{pending:"다음",current:"현재",complete:"이전",error:"오류"}}
          composeAccessibleName={({label})=>label} /></HjmProvider>));
        const list = host.querySelector("ol")!, marks = host.querySelectorAll(".hjm-steps__indicator");
        const bounds = list.getBoundingClientRect();
        expect(Math.abs(marks[0]!.getBoundingClientRect().left - bounds.left - 16)).toBeLessThan(1);
        expect(Math.abs(marks[count-1]!.getBoundingClientRect().right - bounds.right + 16)).toBeLessThan(1);
        expect(marks[0]!.getBoundingClientRect().width).toBe(44);
        expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
        expect(host.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
      }
    }
  } finally { await act(async()=>root.unmount()); host.remove(); }
});
it("allows forward selection only when free reading navigation is explicit", async () => {
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host); const pressed:string[]=[];
  const steps=[{id:"first",label:"전체"},{id:"second",label:"화면"},{id:"third",label:"서버"}];
  const common={statusLabels:{pending:"다음",current:"현재",complete:"이전",error:"오류"},composeAccessibleName:({label}:{label:string})=>label};
  const onStepPress=(id:string)=>pressed.push(id);
  try {
    await act(async()=>root.render(<HjmProvider><Steps {...common} onStepPress={onStepPress} descriptor={{steps,currentStepId:"second"}} /></HjmProvider>));
    expect(host.querySelectorAll("button")).toHaveLength(1);
    await act(async()=>root.render(<HjmProvider><Steps {...common} onStepPress={onStepPress} descriptor={{steps,currentStepId:"second",navigationMode:"free"}} /></HjmProvider>));
    const buttons=host.querySelectorAll("button");
    expect(buttons).toHaveLength(3); expect(buttons[1]!.getAttribute("aria-current")).toBe("step");
    await act(async()=>buttons[2]!.click()); expect(pressed).toEqual(["third"]);
    await act(async()=>buttons[0]!.click()); expect(pressed).toEqual(["third","first"]);
    await act(async()=>root.render(<HjmProvider><Steps {...common} descriptor={{steps,currentStepId:"second",navigationMode:"free"}} /></HjmProvider>));
    expect(host.querySelectorAll("button")).toHaveLength(0);
  } finally {await act(async()=>root.unmount());host.remove();}
});
