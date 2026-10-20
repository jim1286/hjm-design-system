import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { SegmentedControl } from "../src/selection.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it.each(["ltr", "rtl"] as const)("keeps rail actions visible and reveals a selected filter in %s", async direction => {
  const host = document.createElement("div"); host.style.width = "240px"; host.dir = direction; document.body.append(host);
  const root = createRoot(host); let added = 0;
  const items = Array.from({length:8}, (_, index) => ({value:String(index), label:`Place number ${index}`, ...(index === 7 ? { accessibilityLabel: "Last place metric" } : {})}));
  function Example() { const [value, setValue] = useState("0"); return <HjmProvider direction={direction}><SegmentedControl label="Place" presentation="pills" overflow="scroll" value={value} onValueChange={setValue} items={items}
    actions={<button onClick={() => added++}>Add</button>} /></HjmProvider>; }
  try {
    await act(async () => root.render(<Example />));
    const action = [...host.querySelectorAll("button")][0]!;
    const group = host.querySelector("fieldset")!;
    expect(group.contains(action)).toBe(false);
    expect(getComputedStyle(group).direction).toBe(direction);
    const before = action.getBoundingClientRect();
    const last = [...host.querySelectorAll<HTMLInputElement>('input[type="radio"]')].at(-1)!;
    expect(last.getAttribute("aria-label")).toBe("Last place metric");
    expect(last.closest("label")!.textContent).toBe("Place number 7");
    expect(host.querySelector<HTMLInputElement>('input[value="0"]')!.hasAttribute("aria-label")).toBe(false);
    await act(async () => { last.focus(); last.click(); });
    expect(last.checked).toBe(true);
    const viewport = host.querySelector(".hjm-segmented__scroller")!.getBoundingClientRect();
    const bounds = last.closest("label")!.getBoundingClientRect();
    expect(bounds.left).toBeGreaterThanOrEqual(viewport.left - 1);
    expect(bounds.right).toBeLessThanOrEqual(viewport.right + 1);
    expect(action.getBoundingClientRect().x).toBe(before.x);
    expect(action.getBoundingClientRect().right).toBeLessThanOrEqual(host.getBoundingClientRect().right);
    await act(async () => action.click()); expect(added).toBe(1); expect(last.checked).toBe(true);
  } finally { await act(async () => root.unmount()); host.remove(); }
});
