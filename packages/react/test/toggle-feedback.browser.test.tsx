import { act, Profiler, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ToggleFeedbackButton } from "../src/toggle-feedback.js";
import { HjmProvider } from "../src/provider.js";
import { resolveToggleFeedbackProposal } from "@hjmds/design-contracts/toggle-feedback";
import { compositionBrandFixtures } from "../../../showcase/shared/composition-brand-fixtures.js";
import "../src/styles.css";
const labels = { select: "선택", selected: "선택됨", pending: "처리 중", count: "인원", error: "변경 실패" };
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); host.style.width = "375px"; document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.restoreAllMocks(); });
it("captures optimistic counts once, blocks duplicates, and restores actual confirmed state after rejection", async () => {
 let fail!: (error: Error) => void; const change = vi.fn(() => new Promise<void>((_, reject) => { fail = reject; }));
 const view = (id: string, count: number) => <HjmProvider reducedMotion><ToggleFeedbackButton entityId={id} state={{ selected: false, count }} effect="burst" locale="ko-KR" labels={labels} onSelectedChange={change} /></HjmProvider>;
 await act(async () => root.render(view("a", 10))); const button = host.querySelector("button")!;
 await act(async () => { button.click(); button.click(); }); expect(change).toHaveBeenCalledExactlyOnceWith(true); expect(host.textContent).toContain("11"); expect(button.getAttribute("aria-pressed")).toBe("true");
 await act(async () => root.render(view("a", 20))); expect(host.textContent).toContain("11"); await act(async () => fail(new Error("failed"))); expect(host.textContent).toContain("20"); expect(button.getAttribute("aria-pressed")).toBe("false"); expect(host.querySelector('[role="alert"]')?.textContent).toBe("변경 실패");
 await act(async () => button.click()); await act(async () => root.render(view("b", 2))); await act(async () => fail(new Error("old response"))); expect(host.querySelector('[role="alert"]')).toBeNull(); expect(host.textContent).toContain("2");
});
it.each(["ripple", "ribbon", "burst"] as const)("animates %s on selection only and updates hosts without React frame commits", async effect => {
 let commits = 0;
 function Demo() { const [state, setState] = useState({ selected: false, count: 10 }); return <ToggleFeedbackButton entityId="a" state={state} effect={effect} locale="ko-KR" labels={labels} onSelectedChange={async selected => setState(previous => resolveToggleFeedbackProposal(previous, selected))} />; }
 // RTL intentionally uses AnimatedStatistic's accessible static Intl fallback; the glyph still animates.
 await act(async () => root.render(<HjmProvider direction="rtl"><Profiler id="toggle" onRender={() => { commits++; }}><Demo /></Profiler></HjmProvider>));
 const layer = host.querySelector(`[data-toggle-effect="${effect}"]`)!, circle = layer.querySelector("circle")!, rays = layer.querySelector("path")!, glyph = layer.previousElementSibling as HTMLElement;
 expect(circle.getAttribute("opacity")).toBe("0"); expect(rays.getAttribute("opacity")).toBe("0");
 await act(async () => host.querySelector("button")!.click()); const afterSelection = commits;
 if (effect === "ripple") { expect(circle.getAttribute("opacity")).toBe("1"); await expect.poll(() => Number(circle.getAttribute("r"))).toBeGreaterThan(2); }
 if (effect === "burst") { expect(rays.getAttribute("opacity")).toBe("1"); const initial = rays.getAttribute("d"); await expect.poll(() => rays.getAttribute("d")).not.toBe(initial); }
 if (effect === "ribbon") await expect.poll(() => glyph.style.transform).not.toBe("translateY(0px) scale(1)");
 await expect.poll(() => glyph.style.transform).toBe("translateY(0px) scale(1)"); await expect.poll(() => circle.getAttribute("opacity")).toBe("0"); expect(rays.getAttribute("opacity")).toBe("0"); expect(commits).toBe(afterSelection);
 await act(async () => host.querySelector("button")!.click()); expect(host.querySelector("button")!.getAttribute("aria-pressed")).toBe("false"); expect(circle.getAttribute("opacity")).toBe("0"); expect(rays.getAttribute("opacity")).toBe("0"); expect(glyph.style.transform).toBe("translateY(0px) scale(1)");
});
it("settles immediately on background/reduced motion and never replays the consumed selection", async () => {
 let hidden = false; vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
 const view = (selected: boolean, reduced: boolean, active = true) => <HjmProvider reducedMotion={reduced}><ToggleFeedbackButton entityId="a" state={{ selected, count: selected ? 11 : 10 }} effect="burst" active={active} locale="ko-KR" labels={labels} onSelectedChange={() => undefined} /></HjmProvider>;
 await act(async () => root.render(view(false, false))); await act(async () => root.render(view(true, false)));
 const rays = host.querySelector('[data-toggle-effect="burst"] path')!; expect(rays.getAttribute("opacity")).toBe("1"); hidden = true; document.dispatchEvent(new Event("visibilitychange")); expect(rays.getAttribute("opacity")).toBe("0");
 hidden = false; document.dispatchEvent(new Event("visibilitychange")); expect(rays.getAttribute("opacity")).toBe("0");
 await act(async () => root.render(view(false, true))); await act(async () => root.render(view(true, true))); expect(rays.getAttribute("opacity")).toBe("0"); await act(async () => root.render(view(true, false))); expect(rays.getAttribute("opacity")).toBe("0");
 await act(async () => root.render(view(false, false, false))); await act(async () => root.render(view(true, false, false))); expect(rays.getAttribute("opacity")).toBe("0");
});
it("preserves icon slots and inherits two palettes in both themes without overflow", async () => {
 for (const effect of ["ripple", "ribbon", "burst"] as const) for (const brandPalette of Object.values(compositionBrandFixtures)) for (const theme of ["light", "dark"] as const) {
 await act(async () => root.render(<HjmProvider brandPalette={brandPalette} theme={theme} reducedMotion><ToggleFeedbackButton entityId={effect} state={{ selected: true, count: 128 }} effect={effect} locale="ko-KR" labels={labels} icon={<span data-product-icon>●</span>} onSelectedChange={() => undefined} /></HjmProvider>)); expect(host.querySelector('[data-product-icon]')).not.toBeNull(); expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth);
 }
});
