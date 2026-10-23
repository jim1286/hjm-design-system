import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { ChartLegend } from "../src/chart.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); host.style.width = "160px"; document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const items = [
  { id: "left", label: "왼쪽 햇빛", color: "#f59e0b" },
  { id: "right", label: "오른쪽 햇빛", color: "#3b82f6" },
  { id: "none", label: "그늘", color: "#9ca3af" },
];
const tops = () => [...host.querySelectorAll<HTMLElement>(".hjm-chart-legend__item")].map(item => Math.round(item.getBoundingClientRect().top));

it("flows inline entries on a line and wraps them, while stack keeps one row per series", async () => {
  await act(async () => root.render(<HjmProvider><ChartLegend layout="inline" items={items} /></HjmProvider>));
  const [first, second, third] = tops();
  expect(first).toBe(second);
  // 160 wide: the third entry wraps onto the next line instead of overflowing.
  expect(third).toBeGreaterThan(first!);
  expect(host.querySelector("ul")!.scrollWidth).toBeLessThanOrEqual(160);
  await act(async () => root.render(<HjmProvider><ChartLegend layout="stack" items={items} /></HjmProvider>));
  const stacked = tops();
  expect(new Set(stacked).size).toBe(3);
});

it("keeps the 1.41 defaults: passive legends flow inline, selectable legends stack; inline buttons size to content", async () => {
  await act(async () => root.render(<HjmProvider><ChartLegend items={items} /></HjmProvider>));
  expect(host.querySelector("ul")!.dataset.layout).toBe("inline");
  await act(async () => root.render(<HjmProvider><ChartLegend items={items} selectedId={null} onSelect={() => {}} /></HjmProvider>));
  expect(host.querySelector("ul")!.dataset.layout).toBe("stack");
  host.style.width = "400px";
  await act(async () => root.render(<HjmProvider><ChartLegend layout="inline" items={items.slice(0, 2)} selectedId="left" onSelect={() => {}} /></HjmProvider>));
  const [a, b] = [...host.querySelectorAll<HTMLButtonElement>(".hjm-chart-legend__button")];
  expect(a!.getAttribute("aria-pressed")).toBe("true");
  expect(Math.round(a!.getBoundingClientRect().top)).toBe(Math.round(b!.getBoundingClientRect().top));
  await expect(act(async () => root.render(<ChartLegend layout={"grid" as "inline"} items={items} />))).rejects.toThrow(/Unsupported ChartLegend layout/);
});
