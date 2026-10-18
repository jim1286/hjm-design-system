import { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { BottomCTA } from "../src/bottom-cta.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

// 2026-10-18 Utilverse display board: an overlay opened from the footer action must be able to return focus to that
// button, so the action exposes the button itself while the component ref keeps naming the bar.
it("forwards action buttonRef to each action button and keeps the component ref on the bar", async () => {
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const bar = createRef<HTMLDivElement>(), primary = createRef<HTMLButtonElement>(), secondary = createRef<HTMLButtonElement>();
  try {
    await act(async () => root.render(<HjmProvider><BottomCTA ref={bar}
      primaryAction={{ label: "시작", onClick: () => {}, buttonRef: primary }}
      secondaryAction={{ label: "취소", onClick: () => {}, buttonRef: secondary }} /></HjmProvider>));
    expect(bar.current?.classList.contains("hjm-bottom-cta")).toBe(true);
    expect(primary.current?.tagName).toBe("BUTTON");
    expect(primary.current?.textContent).toContain("시작");
    expect(secondary.current?.textContent).toContain("취소");
    primary.current!.focus();
    expect(document.activeElement).toBe(primary.current);
  } finally { await act(async () => root.unmount()); host.remove(); }
});
