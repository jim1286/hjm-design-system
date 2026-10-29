import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { Tag } from "../src/display.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

it("renders a static outline capsule with no plate on a white surface", async () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<HjmProvider><Tag>2017년 2차 3라운드</Tag></HjmProvider>));
    const tag = host.querySelector<HTMLElement>(".hjm-tag")!;
    const style = getComputedStyle(tag);
    expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(style.borderTopWidth).toBe("1px");
    expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThan(100);
    expect(tag.getAttribute("role")).toBeNull();
    expect(tag.tabIndex).toBe(-1);
    expect(tag.textContent).toBe("2017년 2차 3라운드");
  } finally { await act(async () => root.unmount()); host.remove(); }
});
