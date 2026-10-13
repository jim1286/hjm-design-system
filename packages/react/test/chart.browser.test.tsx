import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { BarChart, ChartLegend, LineChart, PieChart, RadarChart, ScatterChart, Sparkline } from "../src/chart.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); host.style.width = "360px"; document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

const months = ["3월", "4월", "5월", "6월"];
const ops = [{ id: "ops", label: "OPS", values: [0.8, null, 0.9, 1.0] }];
const format = (value: number) => value.toFixed(3);
const render = (node: React.ReactNode) => act(async () => root.render(<HjmProvider reducedMotion>{node}</HjmProvider>));
const slider = () => host.querySelector<HTMLElement>('[role="slider"]')!;
const press = (key: string) => act(async () => { slider().dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true })); });

it("draws a line with a gap, a text alternative and the latest observation focused by default", async () => {
  await render(<LineChart categories={months} series={ops} accessibilityLabel="월별 OPS" formatValue={format} missingLabel="기록 없음" />);
  // The missing April splits the line into two segments; it is never drawn as zero.
  expect(host.querySelectorAll(".hjm-chart__line")).toHaveLength(2);
  const description = document.getElementById(slider().getAttribute("aria-describedby")!)!;
  expect(description.textContent).toBe("OPS: 3월 0.800, 4월 기록 없음, 5월 0.900, 6월 1.000");
  expect(slider().getAttribute("aria-label")).toBe("월별 OPS");
  expect(slider().getAttribute("aria-valuetext")).toBe("6월 1.000");
  // The SVG is presentational; the slider and description carry the meaning.
  expect(host.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
});

it("steps keyboard focus over observed categories only", async () => {
  const onFocusChange = vi.fn();
  await render(<LineChart categories={months} series={ops} accessibilityLabel="월별 OPS" formatValue={format} missingLabel="기록 없음" onFocusChange={onFocusChange} />);
  await press("ArrowLeft");
  expect(slider().getAttribute("aria-valuetext")).toBe("5월 0.900");
  await press("ArrowLeft");
  // April has no value, so it is skipped.
  expect(slider().getAttribute("aria-valuetext")).toBe("3월 0.800");
  await press("End");
  expect(slider().getAttribute("aria-valuetext")).toBe("6월 1.000");
  expect(onFocusChange.mock.calls.map(([index, detail]) => [index, detail.scrubbing])).toEqual([[2, false], [0, false], [3, false]]);
});

it("scrubs with a pointer and returns to the latest point on release", async () => {
  const onFocusChange = vi.fn();
  await render(<LineChart categories={months} series={ops} width={360} accessibilityLabel="월별 OPS" formatValue={format} missingLabel="기록 없음" extremes={{ high: "최고", low: "최저" }} onFocusChange={onFocusChange} />);
  const plot = slider(), rect = plot.getBoundingClientRect();
  expect(host.querySelector(".hjm-chart__extreme")).not.toBeNull();
  await act(async () => { plot.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 1, button: 0, clientX: rect.left + 2, clientY: rect.top + 40, bubbles: true })); });
  expect(slider().getAttribute("aria-valuetext")).toBe("3월 0.800");
  expect(host.querySelector(".hjm-chart__bubble")!.textContent).toBe("3월");
  // High/low markers hide while scrubbing so they never cover the cursor.
  expect(host.querySelector(".hjm-chart__extreme")).toBeNull();
  await act(async () => { plot.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1, button: 0, bubbles: true })); });
  expect(slider().getAttribute("aria-valuetext")).toBe("6월 1.000");
  expect(host.querySelector(".hjm-chart__bubble")).toBeNull();
  expect(onFocusChange.mock.calls.at(-1)).toEqual([null, { scrubbing: false }]);
  expect(getComputedStyle(plot).touchAction).toBe("pan-y");
});

it("dims unfocused bars and starts without a focus", async () => {
  const series = [{ id: "hr", label: "홈런", values: [2, 6, null, 7] }];
  await render(<BarChart categories={months} series={series} accessibilityLabel="월별 홈런" formatValue={String} missingLabel="기록 없음" showValues />);
  expect(host.querySelectorAll(".hjm-chart__bar")).toHaveLength(3);
  expect(slider().getAttribute("aria-valuetext")).toBe("월별 홈런");
  await press("ArrowRight");
  expect(slider().getAttribute("aria-valuetext")).toBe("3월 2");
  const opacities = [...host.querySelectorAll(".hjm-chart__bar")].map((bar) => bar.getAttribute("opacity"));
  expect(opacities).toEqual(["1", "0.4", "0.4"]);
  await press("Escape");
  expect(slider().getAttribute("aria-valuetext")).toBe("월별 홈런");
});

it("stacks bars and labels the stack total", async () => {
  const series = [{ id: "a", label: "단타", values: [3, 4, 5, 6] }, { id: "b", label: "홈런", values: [1, 2, 3, 4] }];
  await render(<BarChart categories={months} series={series} layout="stacked" orientation="horizontal" accessibilityLabel="안타" formatValue={String} missingLabel="-" showValues />);
  expect(host.querySelectorAll(".hjm-chart__bar")).toHaveLength(8);
  expect([...host.querySelectorAll(".hjm-chart__value")].map((node) => node.textContent)).toEqual(["4", "6", "8", "10"]);
  expect(slider().getAttribute("aria-orientation")).toBe("vertical");
});

it("selects pie slices from legend buttons and from the slice itself", async () => {
  const onSelect = vi.fn();
  const data = [{ id: "ff", label: "직구", value: 60 }, { id: "sl", label: "슬라이더", value: 40 }, { id: "x", label: "기타", value: null }];
  await render(<PieChart data={data} accessibilityLabel="구종" formatValue={(v) => `${v}개`} onSelect={onSelect} centerContent={<strong>구종</strong>} />);
  expect(host.querySelectorAll(".hjm-chart__slice")).toHaveLength(2);
  expect(host.querySelector(".hjm-chart__pie-center")!.textContent).toBe("구종");
  const buttons = [...host.querySelectorAll<HTMLButtonElement>(".hjm-chart-legend__button")];
  expect(buttons.map((button) => button.textContent)).toEqual(["직구60개 · 60%", "슬라이더40개 · 40%", "기타—"]);
  await act(async () => buttons[1]!.click());
  expect(onSelect).toHaveBeenLastCalledWith("sl");
  expect(buttons[1]!.getAttribute("aria-pressed")).toBe("true");
  expect(host.querySelector('[data-id="sl"]')!.hasAttribute("data-selected")).toBe(true);
  await act(async () => host.querySelector<SVGPathElement>('[data-id="sl"]')!.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  expect(onSelect).toHaveBeenLastCalledWith(null);
});

it("makes slices the buttons when the legend is hidden", async () => {
  const onSelect = vi.fn();
  await render(<PieChart data={[{ id: "a", label: "가", value: 1 }, { id: "b", label: "나", value: 3 }]} accessibilityLabel="비율" formatValue={String} onSelect={onSelect} showLegend={false} />);
  const slice = host.querySelector<SVGPathElement>('[data-id="b"]')!;
  expect(slice.getAttribute("role")).toBe("button");
  expect(slice.getAttribute("aria-label")).toBe("나 3 · 75%");
  slice.focus();
  await act(async () => { slice.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); });
  expect(onSelect).toHaveBeenLastCalledWith("b");
});

it("renders radar polygons with a legend for several series", async () => {
  const axes = ["컨택", "파워", "선구안", "수비"];
  const series = [{ id: "a", label: "A", values: [80, 90, null, 70] }, { id: "b", label: "B", values: [70, 60, 80, 90] }];
  await render(<RadarChart categories={axes} series={series} domain={[0, 100]} accessibilityLabel="능력치" formatValue={String} missingLabel="없음" />);
  expect(host.querySelectorAll(".hjm-chart__polygon")).toHaveLength(2);
  expect(host.querySelector('[role="img"]')!.getAttribute("aria-label")).toBe("능력치");
  expect(host.querySelectorAll(".hjm-chart-legend__item")).toHaveLength(2);
  expect(host.querySelector(".hjm-visually-hidden")!.textContent).toContain("A: 컨택 80, 파워 90, 선구안 없음");
});

it("focuses scatter points along the x axis with the keyboard", async () => {
  const points = [{ id: "b", label: "나", x: 0.3, y: 20 }, { id: "a", label: "가", x: 0.25, y: 10 }];
  const onFocusChange = vi.fn();
  await render(<ScatterChart points={points} accessibilityLabel="타율과 홈런" xLabel="타율" yLabel="홈런" formatX={(v) => v.toFixed(3)} formatY={String} onFocusChange={onFocusChange} />);
  expect(host.querySelectorAll(".hjm-chart__point")).toHaveLength(2);
  await press("ArrowRight");
  expect(slider().getAttribute("aria-valuetext")).toBe("가, 타율 0.250, 홈런 10");
  await press("ArrowRight");
  expect(slider().getAttribute("aria-valuetext")).toBe("나, 타율 0.300, 홈런 20");
  expect(onFocusChange).toHaveBeenLastCalledWith("b");
});

it("keeps an unlabeled sparkline decorative and names a labeled one", async () => {
  await render(<><Sparkline values={[1, 3, null, 2, 4]} /><Sparkline values={[1, 2]} accessibilityLabel="최근 흐름" /></>);
  const [decorative, labeled] = [...host.querySelectorAll("svg.hjm-sparkline")];
  expect(decorative!.getAttribute("aria-hidden")).toBe("true");
  expect(decorative!.querySelectorAll(".hjm-chart__line")).toHaveLength(2);
  expect(labeled!.getAttribute("role")).toBe("img");
  expect(labeled!.getAttribute("aria-label")).toBe("최근 흐름");
});

it("renders a standalone legend with labels next to every swatch", async () => {
  await render(<ChartLegend items={[{ id: "a", label: "선수 A", color: "#2563eb", value: ".912" }, { id: "b", label: "선수 B", color: "#db2777" }]} />);
  expect([...host.querySelectorAll(".hjm-chart-legend__item")].map((item) => item.textContent)).toEqual(["선수 A.912", "선수 B"]);
  expect(host.querySelector("button")).toBeNull();
});

it("uses the dark dataviz palette under a dark provider", async () => {
  await act(async () => root.render(<HjmProvider theme="dark"><Sparkline values={[1, 2]} /></HjmProvider>));
  expect(host.querySelector(".hjm-chart__line")!.getAttribute("stroke")).toBe("#60a5fa");
});
