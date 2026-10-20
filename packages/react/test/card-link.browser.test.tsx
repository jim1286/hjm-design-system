import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Card } from "../src/display.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("owns a named destination across media/body while actions stay independent", async () => {
  const host = document.createElement("div"); host.style.width = "320px"; document.body.append(host); const root = createRoot(host);
  const navigate = vi.fn(), remove = vi.fn();
  try {
    await act(async () => root.render(<HjmProvider><Card href="#letter" aria-label="A letter from Seoul" title="Sender" media={<div style={{height:6}}>Art</div>}
      renderLink={anchor => <a {...anchor} onClick={event => { event.preventDefault(); navigate(event.ctrlKey); }} />}
      actions={<button onClick={remove}>Remove</button>}><p>Preview</p></Card></HjmProvider>));
    const link = host.querySelector<HTMLAnchorElement>("a")!;
    expect(link.getAttribute("href")).toBe("#letter"); expect(link.getAttribute("aria-label")).toBe("A letter from Seoul");
    expect(link.closest("article")).toBeTruthy(); expect(link.querySelector("button")).toBeNull();
    for (const target of host.querySelectorAll('.hjm-card__media,.hjm-card__title,.hjm-card__content')) {
      const bounds = target.getBoundingClientRect();
      expect(document.elementFromPoint(bounds.left+8,bounds.top+bounds.height/2)).toBe(link);
    }
    await act(async () => { link.dispatchEvent(new MouseEvent("click", {bubbles:true,cancelable:true,ctrlKey:true})); });
    expect(navigate).toHaveBeenCalledWith(true); expect(remove).not.toHaveBeenCalled();
    await act(async () => host.querySelector("button")!.click()); expect(remove).toHaveBeenCalledOnce();
    const rect = host.querySelector("button")!.getBoundingClientRect();
    expect(document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2)).toBe(host.querySelector("button"));
    await act(async () => root.render(<HjmProvider><Card href="#letter" disabled aria-label="Unavailable" renderLink={anchor => <a {...anchor} href="#forbidden" />}>Preview</Card></HjmProvider>));
    const disabled = host.querySelector("a")!;
    expect(disabled.hasAttribute("href")).toBe(false); expect(disabled.getAttribute("aria-disabled")).toBe("true"); expect(disabled.tabIndex).toBe(-1);
  } finally { await act(async () => root.unmount()); host.remove(); }
});
