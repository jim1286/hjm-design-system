import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { Anchor } from "../src/anchor.js";
import { ShortcutRail } from "../src/shortcut-rail.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
beforeEach(()=>{host=document.createElement("div");host.style.width="180px";document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
it("keeps decorated section links named, at least 44px and moves focus to their target",async()=>{
 await act(async()=>root.render(<HjmProvider reducedMotion><Anchor label="Settings" orientation="horizontal" historyMode="none"
   items={[{id:"leading-sound",label:"Sound"}]} renderLeading={()=> <svg aria-label="Decorative speaker"/>}/>
   <section id="leading-sound" style={{marginTop:200}}>Sound preferences</section></HjmProvider>));
 const link=host.querySelector("a")!;
 expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
 await act(async()=>page.getByRole("link",{name:"Sound",exact:true}).click());
 expect(document.activeElement).toBe(host.querySelector("section"));
 expect(link.getAttribute("href")).toBe("#leading-sound");
});
it("wraps finite shortcuts and long labels without horizontal scrolling or changing their action",async()=>{
 const action=vi.fn(); const items=[{id:"a",label:"Sound"},{id:"b",label:"Language"},{id:"c",label:"A long translated settings section name"}];
 await act(async()=>root.render(<HjmProvider><ShortcutRail layout="wrap" size="medium" label="Sections" items={items} onAction={action}/></HjmProvider>));
 const list=host.querySelector("ul")!, buttons=[...host.querySelectorAll("button")];
 expect(buttons[2]!.getBoundingClientRect().top).toBeGreaterThan(buttons[0]!.getBoundingClientRect().top);
 expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
 expect(buttons.every(b=>b.getBoundingClientRect().height>=44)).toBe(true);
 await act(async()=>buttons[2]!.click()); expect(action).toHaveBeenCalledWith(items[2]);
});
