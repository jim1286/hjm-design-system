import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { EffectSurface } from "../src/effect-surface.js";
import { TextField } from "../src/forms.js";
import { OverviewScreen } from "../src/design-profile.js";
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import "../src/styles.css";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("keeps ruling in host units outside motion and preserves a focused draft across spacing/removal", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  const animation = vi.spyOn(Element.prototype, "animate");
  const render = (enabled: boolean, ruledSpacing: number) => act(() => root.render(<HjmProvider reducedMotion={false}><EffectSurface descriptor={{ layers: enabled ? ["ruled"] : ["grain"], active: enabled, ruledSpacing }}><TextField label="Draft" defaultValue="initial" /></EffectSurface></HjmProvider>));
  try {
    await render(true, 24);
    const svg = host.querySelector('[data-hjm-effect-layer="ruled"]')!, input = host.querySelector("input")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true"); expect(getComputedStyle(svg).pointerEvents).toBe("none");
    expect(svg.querySelector("pattern")!.getAttribute("patternUnits")).toBe("userSpaceOnUse"); expect(svg.querySelector("pattern")!.getAttribute("height")).toBe("24");
    await act(() => { input.value = "kept"; input.focus(); }); await render(true, 40);
    expect(host.querySelector("input")).toBe(input); expect(document.activeElement).toBe(input); expect(input.value).toBe("kept");
    expect(host.querySelector('[data-hjm-effect-layer="ruled"] pattern')!.getAttribute("height")).toBe("40");
    await render(false, 40); expect(host.querySelector('[data-hjm-effect-layer="ruled"]')).toBeNull(); expect(host.querySelector("input")).toBe(input); expect(input.value).toBe("kept");
    expect(animation).not.toHaveBeenCalled();
  } finally { await act(() => root.unmount()); host.remove(); animation.mockRestore(); }
});
it("propagates the paper canvas through a public screen and removes it in a neutral profile", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  const render = (preset: "paper" | "neutral") => act(() => root.render(<HjmProvider designProfile={defineHjmDesignProfile({ extends: preset })}><OverviewScreen title="Notes" toolbarLabel="Note tools" toolbar={<TextField label="Draft" defaultValue="initial" />} items={[{ id: "one", children: "One" }]} /></HjmProvider>));
  try {
    await render("paper"); const input = host.querySelector("input")!; await act(() => { input.value = "kept"; });
    expect(host.querySelector('[data-hjm-effect-layer="ruled"]')).not.toBeNull();
    await render("neutral"); expect(host.querySelector('[data-hjm-effect-layer="ruled"]')).toBeNull(); expect(host.querySelector("input")).toBe(input); expect(input.value).toBe("kept");
  } finally { await act(() => root.unmount()); host.remove(); }
});
