import { act, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { ColorPicker } from "../src/color-picker.js";
import { Watermark } from "../src/watermark.js";
import { Affix } from "../src/affix.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
const keyboardScenarios = executedScenarioRegistry.executions.find(entry => entry.proofFile === "test/web-additions.browser.test.tsx")!.scenarios;
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const labels = { hue: "Hue", saturation: "Saturation", brightness: "Brightness", hex: "Hex", opacity: "Opacity", invalid: "Invalid hex", presets: "Presets" };
let root: Root | undefined; let host: HTMLDivElement;
afterEach(async () => { if (root) await act(async () => root!.unmount()); host?.remove(); root = undefined; });
async function mount(node: ReactNode, scenario = keyboardScenarios[0]!) { host = document.createElement("div"); document.body.append(host); root = createRoot(host); await act(async () => root!.render(<HjmProvider theme={scenario.theme === "dark" ? "dark" : "light"} direction={scenario.direction === "rtl" ? "rtl" : "ltr"} textScale={scenario.textScale} reducedMotion={scenario.reducedMotion}>{node}</HjmProvider>)); }
const keyboardCase = { componentId: "color-picker" } as const;
// Commit, validation, Escape recovery and alpha arrows must not submit the enclosing form.
// Keep historical maximum-text cases registered without executing them (2026-10-07 user scope).
for (const scenario of keyboardScenarios) {
  it.skipIf(scenario.id === "large-text" || scenario.textScale >= 2)(`${keyboardCase.componentId} ${scenario.id}`, async () => {
    const changes = vi.fn(); const submitted = vi.fn();
    function Example() { const [value, setValue] = useState("#112233ff"); return <form onSubmit={event => { event.preventDefault(); submitted(); }}><ColorPicker label="Accent" labels={labels} alpha value={value} onValueChange={next => { changes(next); setValue(next); }} presets={["#445566ff"]} /><output data-value>{value}</output></form>; }
    await mount(<Example />, scenario);
    expect(getComputedStyle(host.querySelector('input[type="text"]')!).direction).toBe("ltr");
    await page.getByRole("textbox", { name: "Hex" }).fill("#abcd"); await userEvent.keyboard("{Enter}");
    expect(host.querySelector("[data-value]")?.textContent).toBe("#aabbccdd"); expect(submitted).not.toHaveBeenCalled();
    await page.getByRole("textbox", { name: "Hex" }).fill("invalid"); await userEvent.keyboard("{Enter}");
    expect(host.querySelector('[role="alert"]')?.textContent).toBe("Invalid hex"); expect(changes).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{Escape}"); expect((host.querySelector('input[type="text"]') as HTMLInputElement).value).toBe("#aabbccdd");
    expect(host.querySelector('[role="alert"]')).toBeNull();
    const slider = page.getByRole("slider", { name: "Opacity" }).element() as HTMLInputElement; slider.focus(); await userEvent.keyboard("{Home}{ArrowRight}");
    expect(host.querySelector("[data-value]")?.textContent).toBe("#aabbcc03");
    // People press the visible swatch; the radio inside it is visually hidden.
    await userEvent.click(page.getByRole("radio", { name: "#445566ff" }).element().closest("label")!);
    expect(host.querySelector("[data-value]")?.textContent).toBe("#445566ff");
    expect((page.getByRole("radio", { name: "#445566ff" }).element() as HTMLInputElement).checked).toBe(true);
    expect(submitted).not.toHaveBeenCalled();
  });
}
it("color-picker: area, hue and channel sliders edit HSV, keep alpha and keep hue through black", async () => {
  const change = vi.fn();
  function Example() { const [value, setValue] = useState("#ff000080"); return <><ColorPicker label="Accent" labels={labels} alpha value={value} onValueChange={next => { change(next); setValue(next); }} /><output data-value>{value}</output></>; }
  await mount(<Example />);
  const area = host.querySelector<HTMLElement>(".hjm-color-picker__area")!;
  expect(getComputedStyle(area).touchAction).toBe("none");
  const rect = area.getBoundingClientRect();
  await act(async () => {
    area.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, button: 0, clientX: rect.left, clientY: rect.bottom }));
    area.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: rect.left, clientY: rect.bottom }));
  });
  expect(host.querySelector("[data-value]")?.textContent).toBe("#00000080");
  // Black has no hue: the hue bar must stay where it was instead of snapping to red's 0 by recomputing from HEX.
  const hue = page.getByRole("slider", { name: "Hue" }).element() as HTMLInputElement;
  hue.focus(); await userEvent.keyboard("{End}");
  expect(hue.value).toBe("360");
  const brightness = page.getByRole("slider", { name: "Brightness" }).element() as HTMLInputElement;
  brightness.focus(); await userEvent.keyboard("{End}");
  expect(host.querySelector("[data-value]")?.textContent).toBe("#ffffff80");
  const saturation = page.getByRole("slider", { name: "Saturation" }).element() as HTMLInputElement;
  saturation.focus(); await userEvent.keyboard("{End}");
  expect(host.querySelector("[data-value]")?.textContent).toBe("#ff000080");
  // A typed 6-digit HEX keeps the current opacity (2026-09-30 review: it reset to ff).
  await page.getByRole("textbox", { name: "Hex" }).fill("#00ff00"); await userEvent.keyboard("{Enter}");
  expect(change).toHaveBeenLastCalledWith("#00ff0080");
  await act(async () => root!.render(<HjmProvider><ColorPicker label="Accent" labels={labels} value="#fedcba" disabled onValueChange={change} presets={["#112233"]} /></HjmProvider>));
  expect(host.querySelector('input[type="text"]')).toMatchObject({ value: "#fedcba" });
  for (const node of host.querySelectorAll("input")) expect(node.matches(":disabled")).toBe(true);
});
it("watermark: repeated escaped labels never intercept content or share pattern ids", async () => {
  const save = vi.fn();
  await mount(<><Watermark text={'<script>alert("x")</script>'}><button onClick={save}>Save document</button></Watermark><Watermark text="DRAFT"><a href="#test">Open</a></Watermark></>);
  const patterns = [...host.querySelectorAll("pattern")];
  expect(new Set(patterns.map(pattern => pattern.id)).size).toBe(2);
  expect(host.querySelector("script")).toBeNull();
  expect(host.querySelector("text")?.textContent).toBe('<script>alert("x")</script>');
  for (const svg of host.querySelectorAll("svg")) { expect(svg.getAttribute("aria-hidden")).toBe("true"); expect(getComputedStyle(svg).pointerEvents).toBe("none"); }
  await page.getByRole("button", { name: "Save document" }).click(); expect(save).toHaveBeenCalledOnce();
  await userEvent.keyboard("{Tab}"); expect(document.activeElement?.textContent).toBe("Open");
});
it("affix: follows nested scrolling and offset changes, preserves focus, and disables without remounting", async () => {
  const change = vi.fn();
  const example = (offset: number, disabled = false) => <div data-scroll style={{ height: 200, overflow: "auto", border: "2px solid" }}><div style={{ height: 100 }} /><Affix offset={offset} disabled={disabled} onChange={change}><button>Sticky action</button></Affix><div style={{ height: 600 }} /></div>;
  await mount(example(10));
  const scroll = host.querySelector<HTMLElement>("[data-scroll]")!; const sticky = host.querySelector<HTMLElement>("[data-hjm-affix]")!; const button = host.querySelector("button")!;
  button.focus({ preventScroll: true });
  await act(async () => { scroll.scrollTop = 150; scroll.dispatchEvent(new Event("scroll")); });
  await vi.waitFor(() => expect(sticky.dataset.affixed).toBe("true"));
  expect(Math.abs(sticky.getBoundingClientRect().top - scroll.getBoundingClientRect().top - scroll.clientTop - 10)).toBeLessThan(1);
  expect(document.activeElement).toBe(button); expect(change).toHaveBeenLastCalledWith(true);
  await act(async () => root!.render(<HjmProvider>{example(24)}</HjmProvider>));
  await vi.waitFor(() => expect(Math.round(sticky.getBoundingClientRect().top - scroll.getBoundingClientRect().top - scroll.clientTop)).toBe(24));
  await act(async () => root!.render(<HjmProvider>{example(24, true)}</HjmProvider>));
  await vi.waitFor(() => expect(sticky.dataset.affixed).toBe("false"));
  expect(host.querySelector("button")).toBe(button); expect(document.activeElement).toBe(button);
});
it("affix: releases at the containing block end and leaves oversized content in normal flow", async () => {
  await mount(<div data-scroll style={{ height: 160, overflow: "auto" }}><section style={{ height: 260 }}><div style={{ height: 80 }} /><Affix offset={8}><button>Bounded</button></Affix></section><div style={{ height: 300 }} /></div>);
  const scroll = host.querySelector<HTMLElement>("[data-scroll]")!;
  await act(async () => { scroll.scrollTop = 260; scroll.dispatchEvent(new Event("scroll")); });
  await vi.waitFor(() => expect(host.querySelector<HTMLElement>("[data-hjm-affix]")!.getBoundingClientRect().top).toBeLessThan(scroll.getBoundingClientRect().top));
  await act(async () => root!.render(<HjmProvider><div style={{ height: 100, overflow: "auto" }}><Affix><div style={{ height: 200 }}>Tall content</div></Affix></div></HjmProvider>));
  await vi.waitFor(() => expect(host.querySelector<HTMLElement>("[data-hjm-affix]")!.dataset.oversize).toBe("true"));
  expect(getComputedStyle(host.querySelector("[data-hjm-affix]")!).position).toBe("relative");
});

it("affix: cancels pending observation when unmounted and accepts fresh callbacks", async () => {
  const first = vi.fn(); const second = vi.fn();
  const view = (onChange: (value: boolean) => void) => <div data-scroll style={{ height: 200, overflow: "auto" }}><div style={{ height: 100 }} /><Affix onChange={onChange}><button>Action</button></Affix><div style={{ height: 600 }} /></div>;
  await mount(view(first));
  await act(async () => root!.render(<HjmProvider>{view(second)}</HjmProvider>));
  const scroll = host.querySelector<HTMLElement>("[data-scroll]")!;
  await act(async () => { scroll.scrollTop = 160; scroll.dispatchEvent(new Event("scroll", { bubbles: true })); });
  await vi.waitFor(() => expect(second).toHaveBeenCalledWith(true));
  first.mockClear(); second.mockClear();
  await act(async () => { scroll.dispatchEvent(new Event("scroll", { bubbles: true })); root!.render(null); });
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  expect(first).not.toHaveBeenCalled(); expect(second).not.toHaveBeenCalled();
});
