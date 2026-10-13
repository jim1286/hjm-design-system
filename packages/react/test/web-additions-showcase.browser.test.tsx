import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { HjmProvider } from "@hjmds/react/provider";
import { WebAdditionsPreview } from "../../../showcase/web/src/patterns/WebAdditions.previews.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?: boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement("div");document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const frames=()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
const render=(mode:"color"|"watermark"|"affix")=>act(async()=>{root.render(<HjmProvider reducedMotion><WebAdditionsPreview mode={mode}/></HjmProvider>);await frames();});
const button=()=>host.querySelector<HTMLButtonElement>("button")!;
const fill=(input:HTMLInputElement,value:string)=>act(async()=>{input.focus();Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")!.set!.call(input,value);input.dispatchEvent(new Event("input",{bubbles:true}));});
it("keeps confirmed color through invalid edits and preserves alpha across HEX and preset input",async()=>{
 await render("color");const hex=host.querySelector<HTMLInputElement>('input[type="text"]')!;
 await fill(hex,"bad-hex");await act(async()=>userEvent.keyboard("{Enter}"));expect(host.querySelector('[role="alert"]')!.textContent).toContain("올바른 HEX");expect(host.querySelector('[role="status"]')!.textContent).toContain("#b94627cc");
 await act(async()=>userEvent.keyboard("{Escape}"));expect(hex.value).toBe("#b94627cc");expect(host.querySelector('[role="alert"]')).toBeNull();
 await fill(hex,"#3aF");await act(async()=>userEvent.keyboard("{Enter}"));expect(hex.value).toBe("#33aaffcc");
 await act(async()=>page.getByRole("button",{name:"#338844ff",exact:true}).click());expect(hex.value).toBe("#338844ff");expect(host.querySelector<HTMLInputElement>('input[type="range"]')!.value).toBe("100");
});
it("lets a pointer cross the watermark and keeps a confirmed save instead of toggling it off",async()=>{
 await render("watermark");const trigger=button();expect(getComputedStyle(host.querySelector("svg")!).pointerEvents).toBe("none");
 await act(async()=>page.getByRole("button",{name:"문서 저장",exact:true}).click());expect(trigger.textContent).toBe("저장됨");
 await act(async()=>trigger.click());expect(trigger.textContent).toBe("저장됨");expect(trigger.getAttribute("aria-disabled")).toBe("true");
});
it("keeps the sticky save node and keyboard focus through actual inner scrolling",async()=>{
 await render("affix");const affix=host.querySelector<HTMLElement>('[data-hjm-affix]')!,scroller=affix.parentElement!;const trigger=button();await act(async()=>trigger.focus());
 await act(async()=>{scroller.scrollTop=240;scroller.dispatchEvent(new Event("scroll"));await frames();});
 await expect.poll(()=>affix.dataset.affixed).toBe("true");expect(Math.abs(affix.getBoundingClientRect().top-scroller.getBoundingClientRect().top-8)).toBeLessThan(1.1);expect(document.activeElement).toBe(trigger);
 await act(async()=>trigger.click());expect(trigger.textContent).toBe("저장됨");expect(button()).toBe(trigger);expect(document.activeElement).toBe(trigger);
 await act(async()=>{scroller.scrollTop=0;scroller.dispatchEvent(new Event("scroll"));await frames();});await expect.poll(()=>affix.dataset.affixed).toBe("false");expect(host.textContent).toContain("일반 위치");expect(trigger.textContent).toBe("저장됨");
});
it("keeps independent save states when selecting another demonstration",async()=>{
 await render("watermark");await act(async()=>button().click());await render("affix");expect(button().textContent).toBe("변경 저장");
 await act(async()=>button().click());await render("watermark");expect(button().textContent).toBe("저장됨");
});
