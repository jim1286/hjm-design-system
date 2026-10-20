import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { RadioGroup, CheckboxGroup } from "../src/selection.js";
import "../src/styles.css";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
beforeEach(() => { host = document.createElement("div"); host.style.width = "360px"; document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const grid = { columns: { compact: 2 }, gap: { compact: "xs" as const }, minColumnWidth: { compact: 152 } };
it("keeps different length radio cards equal, then collapses inside a narrow container without losing selection", async () => {
  await act(async () => root.render(<HjmProvider><RadioGroup label="Scope" defaultValue="public" size="small" grid={grid}
    items={[{ value: "public", label: "Public", description: "A longer explanation wraps inside its own card" }, { value: "private", label: "Private", description: "One person" }]} /></HjmProvider>));
  const group = host.querySelector("fieldset")!;
  expect(group.getBoundingClientRect().x).toBe(host.getBoundingClientRect().x);
  expect(group.getBoundingClientRect().width).toBe(360);
  const labelRange = document.createRange(); labelRange.selectNodeContents(group.querySelector("legend")!);
  expect(labelRange.getBoundingClientRect().x).toBe(group.getBoundingClientRect().x);
  const cards = () => [...host.querySelectorAll<HTMLElement>("label.hjm-choice")];
  await expect.poll(() => host.querySelector<HTMLElement>(".hjm-grid")!.dataset.columns).toBe("2");
  expect(cards()[0]!.getBoundingClientRect().width).toBeCloseTo(cards()[1]!.getBoundingClientRect().width);
  const radio = host.querySelectorAll<HTMLInputElement>('input[type="radio"]')[1]!;
  await act(async () => radio.click());
  expect(radio.checked).toBe(true);
  host.style.width = "280px";
  await expect.poll(() => host.querySelector<HTMLElement>(".hjm-grid")!.dataset.columns).toBe("1");
  expect(cards().every(card => card.getBoundingClientRect().width <= 280)).toBe(true);
  expect(radio.checked).toBe(true);
  expect(host.scrollWidth).toBeLessThanOrEqual(280);
});
it("keeps checkbox multi-selection independent inside the same grid layout", async () => {
  await act(async () => root.render(<HjmProvider><CheckboxGroup label="Options" grid={grid} items={[{ id: "a", label: "A" }, { id: "b", label: "B" }]} /></HjmProvider>));
  const group = host.querySelector("fieldset")!;
  expect(group.getBoundingClientRect().width).toBe(360);
  const labelRange = document.createRange(); labelRange.selectNodeContents(group.querySelector("legend")!);
  expect(labelRange.getBoundingClientRect().x).toBe(group.getBoundingClientRect().x);
  const checks = host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
  await act(async () => { checks[0]!.click(); checks[1]!.click(); });
  expect([...checks].map(item => item.checked)).toEqual([true, true]);
});
it("hides only the decorative radio dot while keeping native selection and disabled behavior", async () => {
  const changed: string[] = [];
  await act(async () => root.render(<HjmProvider><RadioGroup label="Reaction" indicator="none"
    items={[{value:"wave",label:"Moved"},{value:"dove",label:"Thanks",disabled:true}]}
    onValueChange={value => changed.push(value)} /></HjmProvider>));
  expect(host.querySelectorAll(".hjm-choice__indicator")).toHaveLength(0);
  const inputs = host.querySelectorAll<HTMLInputElement>('input[type="radio"]');
  expect(inputs).toHaveLength(2);
  expect(inputs[0]!.checked).toBe(false);
  await act(async () => inputs[0]!.click());
  expect(inputs[0]!.checked).toBe(true);
  expect(changed).toEqual(["wave"]);
  await act(async () => inputs[1]!.click());
  expect(inputs[0]!.checked).toBe(true);
  expect(changed).toEqual(["wave"]);
  await act(async () => root.render(<HjmProvider><RadioGroup label="Default" items={[{value:"a",label:"A"}]} /></HjmProvider>));
  expect(host.querySelectorAll(".hjm-choice__indicator")).toHaveLength(1);
});
