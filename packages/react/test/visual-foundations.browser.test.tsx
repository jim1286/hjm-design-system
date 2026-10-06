import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Search } from "lucide-react";
import { EffectSurface } from "../src/effect-surface.js";
import { Icon } from "../src/supplemental-display.js";
import { createLucideGlyph } from "../src/icon-lucide.js";
import { HjmProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("keeps effects decorative and cancels active animation when reduced motion is enabled", async () => {
  const host = document.createElement("div");document.body.append(host);const root = createRoot(host);
  const render = (reducedMotion: boolean) => <HjmProvider reducedMotion={reducedMotion}><EffectSurface descriptor={{ layers: ["mesh", "glow", "grain", "noise"], active: true }}><button>Continue</button></EffectSurface></HjmProvider>;
  try {
    await act(() => root.render(render(false)));
    await act(async () => { await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
    await expect.poll(() => host.querySelector("svg")!.getAnimations().length).toBe(1);
    expect(host.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
    host.querySelector("button")!.focus();expect(document.activeElement).toBe(host.querySelector("button"));
    const geometry = host.querySelector("svg")!.innerHTML;
    await act(() => root.render(render(true)));
    expect(host.querySelector("svg")!.getAnimations()).toHaveLength(0);
    expect(host.querySelector("svg")!.innerHTML).toBe(geometry);
  } finally { await act(() => root.unmount());host.remove(); }
});
it("uses the existing Icon's RTL and accessible name around a selected Lucide glyph", async () => {
  const host = document.createElement("div");document.body.append(host);const root=createRoot(host);
  try {
    const renderGlyph=createLucideGlyph({ back: Search });
    await act(() => root.render(<HjmProvider direction="rtl"><Icon name="back" decorative={false} accessibilityLabel="돌아가기" renderGlyph={renderGlyph}/></HjmProvider>));
    expect(host.querySelectorAll('[role="img"]')).toHaveLength(1);
    expect(host.querySelector('.hjm-icon')!.getAttribute('data-transform')).toBe('mirror-inline');
    expect(host.querySelector('.lucide')!.getAttribute('aria-hidden')).toBe('true');
    expect(() => createLucideGlyph({})({name:'missing',size:24,color:'currentColor',strokeWidth:2})).toThrow();
  } finally {await act(() => root.unmount());host.remove();}
});

it("keeps static layers and actionable content when the host rejects animation creation", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  const animate = vi.spyOn(Element.prototype, "animate").mockImplementation(() => { throw new DOMException("Animation unavailable", "NotSupportedError"); });
  const action = vi.fn();
  try {
    await act(() => root.render(<HjmProvider><EffectSurface descriptor={{ active: true }}><button onClick={action}>Continue</button></EffectSurface></HjmProvider>));
    await act(async () => { await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
    await expect.poll(() => animate.mock.calls.length).toBe(1);
    document.dispatchEvent(new Event("visibilitychange"));
    expect(animate).toHaveBeenCalledTimes(1);
    expect(host.querySelector("svg")).not.toBeNull();
    await act(() => host.querySelector("button")!.click());
    expect(action).toHaveBeenCalledTimes(1);
  } finally { await act(() => root.unmount()); host.remove(); animate.mockRestore(); }
});
