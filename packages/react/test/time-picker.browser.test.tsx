import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { compositionBrandFixtures } from "../../../showcase/shared/composition-brand-fixtures.js";
import { TimePicker, type TimePickerProps } from "../src/time-picker.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const labels = { label: "Time", hour: "Hour", minute: "Minute", placeholder: "Choose time", confirm: "Confirm", cancel: "Cancel" };
let host: HTMLDivElement, root: Root;
beforeEach(() => { host = document.createElement("div"); host.style.width = "320px"; document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = (props: Partial<TimePickerProps> = {}) => act(async () => root.render(<HjmProvider reducedMotion><TimePicker value="14:30" onValueChange={() => {}} labels={labels} {...props} /></HjmProvider>));
const option = (label: string) => document.querySelector<HTMLButtonElement>(`[role="option"][aria-label="${label}"]`)!;
const trigger = () => host.querySelector<HTMLButtonElement>(".hjm-time-picker__trigger")!;
const click = (node: HTMLElement) => act(async () => node.click());
it("time-picker keeps a single two-column session open until confirmation and restores focus", async () => {
  const changed = vi.fn(); await render({ onValueChange: changed }); await click(trigger());
  await click(option("00 Hour")); await click(option("00 Minute"));
  expect(changed).not.toHaveBeenCalled(); expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
  await click([...document.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent === "Confirm")!);
  expect(changed).toHaveBeenLastCalledWith("00:00"); expect(document.activeElement).toBe(trigger());
});
it("time-picker cancels on Escape, reopens from the committed value, and follows external updates", async () => {
  const changed = vi.fn(); await render({ onValueChange: changed }); await click(trigger()); await click(option("23 Hour"));
  await act(async () => { option("23 Hour").focus(); }); await act(async () => userEvent.keyboard("{Escape}"));
  expect(changed).not.toHaveBeenCalled(); expect(document.activeElement).toBe(trigger()); await click(trigger());
  expect(option("14 Hour").getAttribute("aria-selected")).toBe("true");
  await render({ value: "09:15", onValueChange: changed }); expect(option("09 Hour").getAttribute("aria-selected")).toBe("true");
});
it("time-picker provides roving keyboard navigation, skips unavailable slots, and supports Home/End", async () => {
  await render({ presentation: "inline", minuteStep: 15, isTimeUnavailable: value => value.endsWith(":15") });
  await act(async () => option("30 Minute").focus()); await act(async () => userEvent.keyboard("{ArrowUp}"));
  expect(document.activeElement).toBe(option("00 Minute"));
  await act(async () => userEvent.keyboard("{End}")); expect(document.activeElement).toBe(option("45 Minute"));
  await act(async () => userEvent.keyboard("{Home}")); expect(document.activeElement).toBe(option("00 Minute"));
  expect(host.querySelectorAll('[role="option"][tabindex="0"]')).toHaveLength(2);
});
it("time-picker emits null for incomplete/unavailable inline edits while preserving the partial draft", async () => {
  const changed = vi.fn();
  function Consumer() { const [value, setValue] = useState<string | null>("14:30"); return <TimePicker presentation="inline" labels={labels} value={value} isTimeUnavailable={v => v === "15:30"} onValueChange={v => { changed(v); setValue(v); }} />; }
  await act(async () => root.render(<HjmProvider><Consumer /></HjmProvider>));
  await click(option("15 Hour")); expect(changed).toHaveBeenLastCalledWith(null); expect(option("15 Hour").getAttribute("aria-selected")).toBe("true");
  await click(option("45 Minute")); expect(changed).toHaveBeenLastCalledWith("15:45");
});
it.each(["disabled", "readOnly"] as const)("time-picker closes when %s changes without committing", async state => {
  const changed = vi.fn(); await render({ onValueChange: changed }); await click(trigger()); await click(option("23 Hour"));
  await render({ [state]: true, onValueChange: changed }); expect(document.querySelector('[role="dialog"]:not([aria-hidden="true"])')).toBeNull(); expect(changed).not.toHaveBeenCalled();
});
it.each(["light", "dark"] as const)("time-picker keeps the inline panel readable and inside 320px in %s", async theme => {
  await act(async () => root.render(<HjmProvider theme={theme} direction="rtl" reducedMotion><TimePicker presentation="inline" value="14:30" labels={labels} onValueChange={() => {}} /></HjmProvider>));
  const readout = host.querySelector<HTMLElement>('.hjm-time-picker__readout')!;
  expect(getComputedStyle(readout).direction).toBe("ltr");
  expect(host.scrollWidth).toBeLessThanOrEqual(320);
  expect(option("14 Hour").getAttribute("aria-selected")).toBe("true");
  expect(option("14 Hour").getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
});

it("time-picker keeps empty fields uncommitted until both parts are chosen", async () => {
 const changed = vi.fn(); await render({ value: null, onValueChange: changed }); await click(trigger());
 const confirm = [...document.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent === "Confirm")!;
 expect(confirm.disabled).toBe(true); await click(option("00 Hour")); expect(confirm.disabled).toBe(true);
 await click(option("00 Minute")); expect(confirm.disabled).toBe(false); expect(changed).not.toHaveBeenCalled();
 await click(confirm); expect(changed).toHaveBeenLastCalledWith("00:00");
});
it("time-picker inherits two product palettes in both themes", async () => {
 for (const brandPalette of Object.values(compositionBrandFixtures)) for (const theme of ["light", "dark"] as const) {
  await act(async () => root.render(<HjmProvider brandPalette={brandPalette} theme={theme}><TimePicker presentation="inline" value="14:30" labels={labels} onValueChange={() => {}} /></HjmProvider>));
  const color = getComputedStyle(option("14 Hour")).color;
  const expected = document.createElement('span'); expected.style.color = brandPalette[theme].contentBrand; host.append(expected);
  expect(color).toBe(getComputedStyle(expected).color); expected.remove();
 }
});
