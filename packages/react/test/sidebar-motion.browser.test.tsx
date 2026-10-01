import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { Sidebar, type SidebarAppearance } from "../src/sidebar.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it("decorates icons while preserving link bounds and disabling motion with the provider",async()=>{
 const host=document.createElement("div");document.body.append(host);const root=createRoot(host);
 function Demo({appearance,reduced=false}:{appearance:SidebarAppearance;reduced?:boolean}){const[current,setCurrent]=useState("a");return <HjmProvider reducedMotion={reduced}><Sidebar appearance={appearance} renderIcon={()=>"●"} onNavigate={setCurrent} descriptor={{accessibilityLabel:"Menu",currentId:current,groups:[{id:"main",items:[{id:"a",label:"First",destination:{kind:"internal",href:"#a"}},{id:"b",label:"Second",destination:{kind:"internal",href:"#b"}}]}]}}/></HjmProvider>;}
 try{
  await act(()=>root.render(<Demo appearance="proximity"/>));const link=host.querySelector<HTMLElement>('.hjm-sidebar__item')!;const before=link.getBoundingClientRect();
  await act(()=>link.dispatchEvent(new PointerEvent("pointermove",{bubbles:true,pointerType:"mouse",clientY:before.top+before.height/2})));
  expect(Number(link.style.getPropertyValue('--hjm-sidebar-proximity'))).toBe(1);
  const after=link.getBoundingClientRect();expect([after.x,after.y,after.width,after.height]).toEqual([before.x,before.y,before.width,before.height]);
  await act(()=>root.render(<Demo appearance="proximity" reduced/>));expect(getComputedStyle(host.querySelector('.hjm-sidebar__icon')!).transform).toBe("none");
  await act(()=>root.render(<Demo appearance="bounce"/>));await act(()=>host.querySelectorAll<HTMLElement>('.hjm-sidebar__item')[1]!.click());expect(host.querySelector('[aria-current="page"]')!.textContent).toContain("Second");expect(getComputedStyle(host.querySelector('[aria-current="page"] .hjm-sidebar__icon')!).animationName).toBe("hjm-sidebar-bounce");
  await act(()=>root.render(<Demo appearance="bounce" reduced/>));expect(getComputedStyle(host.querySelector('[aria-current="page"] .hjm-sidebar__icon')!).animationName).toBe("none");
  await act(()=>root.render(<Demo appearance="hook"/>));expect(getComputedStyle(host.querySelector('[aria-current="page"]')!).borderInlineStartWidth).toBe("3px");
 }finally{await act(()=>root.unmount());host.remove();}
});
