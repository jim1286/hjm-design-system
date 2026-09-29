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
const labels = { color: "Choose color", hex: "Hex", opacity: "Opacity", invalid: "Invalid hex" };
let root: Root | undefined; let host: HTMLDivElement;
afterEach(async () => { if (root) await act(async () => root!.unmount()); host?.remove(); root = undefined; });
async function mount(node: ReactNode, scenario = keyboardScenarios[0]!) { host = document.createElement("div"); document.body.append(host); root = createRoot(host); await act(async () => root!.render(<HjmProvider theme={scenario.theme === "dark" ? "dark" : "light"} direction={scenario.direction === "rtl" ? "rtl" : "ltr"} textScale={scenario.textScale} reducedMotion={scenario.reducedMotion}>{node}</HjmProvider>)); }
const keyboardCase = { componentId: "color-picker" } as const;
// Commit, validation, Escape recovery and alpha arrows must not submit the enclosing form.
it.each(keyboardScenarios)(`${keyboardCase.componentId} $id`, async scenario => {
  const changes = vi.fn(); const submitted = vi.fn();
  function Example() { const [value, setValue] = useState("#112233ff"); return <form onSubmit={event => { event.preventDefault(); submitted(); }}><ColorPicker label="Accent" labels={labels} alpha value={value} onValueChange={next => { changes(next); setValue(next); }} presets={["#445566ff"]} /><output data-value>{value}</output></form>; }
  await mount(<Example />, scenario);
  expect(getComputedStyle(host.querySelector('input[type="text"]')!).direction).toBe("ltr");
  expect(host.querySelector("button bdi")?.getAttribute("dir")).toBe("ltr");
  await page.getByRole("textbox", { name: "Hex" }).fill("#abcd"); await userEvent.keyboard("{Enter}");
  expect(host.querySelector("[data-value]")?.textContent).toBe("#aabbccdd"); expect(submitted).not.toHaveBeenCalled();
  await page.getByRole("textbox", { name: "Hex" }).fill("invalid"); await userEvent.keyboard("{Enter}");
  expect(host.querySelector('[role="alert"]')?.textContent).toBe("Invalid hex"); expect(changes).toHaveBeenCalledTimes(1);
  await userEvent.keyboard("{Escape}"); expect((host.querySelector('input[type="text"]') as HTMLInputElement).value).toBe("#aabbccdd");
  expect(host.querySelector('[role="alert"]')).toBeNull();
  const slider = host.querySelector<HTMLInputElement>('input[type="range"]')!; slider.focus(); await userEvent.keyboard("{Home}{ArrowRight}");
  expect(host.querySelector("[data-value]")?.textContent).toBe("#aabbcc03");
  await page.getByRole("button", { name: "#445566ff" }).click();
  expect(host.querySelector("[data-value]")?.textContent).toBe("#445566ff");
  expect(host.querySelector('button[aria-pressed="true"]')?.textContent).toContain("#445566ff");
});
it("color-picker: native RGB changes preserve alpha; external updates and disabled controls remain controlled", async () => {
  const change = vi.fn();
  await mount(<ColorPicker label="Accent" labels={labels} alpha value="#12345680" onValueChange={change} />);
  const native = host.querySelector<HTMLInputElement>('input[type="color"]')!;
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(native, "#abcdef"); native.dispatchEvent(new Event("input", { bubbles: true })); native.dispatchEvent(new Event("change", { bubbles: true })); });
  expect(change).toHaveBeenCalledWith("#abcdef80");
  // A typed 6-digit HEX keeps the current opacity like the native input (2026-09-30 review: it reset to ff).
  await page.getByRole("textbox", { name: "Hex" }).fill("#00ff00"); await userEvent.keyboard("{Enter}");
  expect(change).toHaveBeenLastCalledWith("#00ff0080");
  await act(async () => root!.render(<HjmProvider><ColorPicker label="Accent" labels={labels} value="#fedcba" disabled onValueChange={change} presets={["#112233"]} /></HjmProvider>));
  expect(host.querySelector('input[type="text"]')).toMatchObject({ value: "#fedcba" });
  for (const node of host.querySelectorAll("input,button")) expect(node.matches(":disabled")).toBe(true);
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
