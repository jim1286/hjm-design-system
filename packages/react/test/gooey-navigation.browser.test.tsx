import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { Tabs } from "../src/navigation.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const items = [{ id: "one", label: "One", panel: "First" }, { id: "disabled", label: "Disabled", disabled: true }, { id: "two", label: "Second long label", panel: "Second" }];
it("keeps keyboard selection and panels canonical while animating only the indicator", async () => {
 const host=document.createElement("div");document.body.append(host);const root=createRoot(host);
 const render=(reduced=false)=>root.render(<HjmProvider reducedMotion={reduced}><Tabs label="Sections" appearance="gooey" items={items}/></HjmProvider>);
 try{await act(()=>render());await new Promise(resolve=>requestAnimationFrame(resolve));const tabs=host.querySelectorAll<HTMLButtonElement>('[role="tab"]');
 await act(()=>{tabs[0]!.focus();tabs[0]!.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true}));});
 expect(document.activeElement).toBe(tabs[2]);
 await act(()=>tabs[2]!.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true})));
 expect(tabs[2]!.getAttribute("aria-selected")).toBe("true");expect(document.activeElement).toBe(tabs[2]);expect(host.querySelector('[role="tabpanel"]')?.textContent).toBe("Second");
 expect(host.getAnimations({subtree:true})).toHaveLength(1);
 await act(()=>render(true));expect(host.getAnimations({subtree:true})).toHaveLength(0);
 expect(host.querySelector('.hjm-tabs__gooey')?.getAttribute('aria-hidden')).toBe('true');
 }finally{await act(()=>root.unmount());host.remove();}
});
