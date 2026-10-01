import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { GravityLetters } from "../src/gravity-letters.js";
import { HjmProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("replays explicit accents and cancels motion without changing text or semantics", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  const render = (active: boolean, reduced = false, replayKey = 0) => root.render(<HjmProvider reducedMotion={reduced}><GravityLetters glyphs={["👨‍👩‍👦", "한"]} active={active} replayKey={replayKey}/></HjmProvider>);
  try {
    await act(() => render(false)); expect(host.getAnimations({ subtree: true })).toHaveLength(0);
    await act(() => render(true)); const before = host.getAnimations({ subtree: true }); expect(before).toHaveLength(2);
    await act(() => render(true, false, 1)); expect(before.every(animation => animation.playState === "idle")).toBe(true);
    expect(host.getAnimations({ subtree: true })).toHaveLength(2);
    await act(() => render(true, true, 1)); expect(host.getAnimations({ subtree: true })).toHaveLength(0);
    expect(host.querySelector('[aria-hidden="true"]')!.textContent).toBe("👨‍👩‍👦한");
    await act(() => render(false)); expect(host.getAnimations({ subtree: true })).toHaveLength(0);
  } finally { await act(() => root.unmount()); host.remove(); }
});
