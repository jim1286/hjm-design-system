import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { screenPatternRecipe } from "@hjmds/design-contracts/screen-patterns";
import { comboboxRecipe, menuRecipe, selectRecipe, statisticRecipe, tooltipRecipe } from "@hjmds/design-contracts/recipes";
import { datePickerRecipe } from "@hjmds/design-contracts/components/date-picker";
import { typography } from "@hjmds/design-contracts/foundations";
import { afterEach, beforeEach, expect, it } from "vitest";
import { Statistic } from "../src/advanced-display.js";
import { DatePicker } from "../src/date-picker.js";
import { Section } from "../src/layout.js";
import { Mentions } from "../src/mentions.js";
import { Menu, Tooltip } from "../src/overlays.js";
import { HjmProvider } from "../src/provider.js";
import { MessageComposer } from "../src/screens.js";
import "../src/styles.css";

// Regression proofs for the last seven Web/Native/recipe drifts closed before the 1.13 release (2026-10-06).
// Each assertion failed against the previous stylesheet; the comment names the old value.
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  await page.viewport(414, 896);
});
async function render(node: React.ReactNode) {
  await act(async () => root.render(<HjmProvider reducedMotion>{node}</HjmProvider>));
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 20)); });
}
const px = (value: number) => `${value}px`;
const css = (element: Element) => getComputedStyle(element);
function rect(left: number, top: number, width: number, height: number): DOMRect {
  return { x: left, y: top, left, top, width, height, right: left + width, bottom: top + height, toJSON: () => ({}) };
}
/** A bare element carrying a renderer class, inside the provider so the recipe variables resolve. */
function probe(className: string) {
  const host = container.querySelector(".hjm-provider, [data-hjm-provider]") ?? container.firstElementChild ?? container;
  const element = document.createElement("div");
  element.className = className;
  host.append(element);
  return element;
}

it("Tooltip pads its content with tooltipRecipe.surface.padding on every side", async () => {
  await render(<Tooltip defaultOpen trigger={<button type="button">도움말</button>} content="설명" />);
  const tooltip = document.body.querySelector<HTMLElement>('[role="tooltip"]')!;
  // Before: 8 block / 12 inline.
  expect(css(tooltip).paddingTop).toBe(px(tooltipRecipe.surface.padding));
  expect(css(tooltip).paddingInlineStart).toBe(px(tooltipRecipe.surface.padding));
});

it("Section title and description use sectionRecipe text variants", async () => {
  await render(<Section title="최근 기록" description="이번 주">내용</Section>);
  // Before: both inherited body (14).
  expect(css(container.querySelector(".hjm-section__title")!).fontSize).toBe(px(typography.title.fontSize));
  expect(css(container.querySelector(".hjm-section__description")!).fontSize).toBe(px(typography.caption.fontSize));
});

it("Menu, ContextMenu, Select and Combobox popups use the floating surface padding", async () => {
  await render(<Menu defaultOpen label="작업" trigger={<button type="button">작업</button>} items={[{ id: "edit", label: "수정" }]} />);
  // Before: 4 (space-xxs) on all four surfaces.
  expect(css(document.body.querySelector('[role="menu"]')!).paddingTop).toBe(px(menuRecipe.surface.padding));
  expect(css(probe("hjm-context-menu")).paddingTop).toBe(px(menuRecipe.surface.padding));
  expect(css(probe("hjm-select__listbox")).paddingTop).toBe(px(selectRecipe.popover.padding));
  expect(css(probe("hjm-combobox__listbox")).paddingTop).toBe(px(comboboxRecipe.popover.padding));
  expect(css(probe("hjm-mentions__list")).paddingTop).toBe(px(comboboxRecipe.popover.padding));
});

function MentionsFixture() {
  const [value, setValue] = useState("");
  return <Mentions label="기록" value={value} onValueChange={setValue} triggers={[{ id: "person", trigger: "@" }]}
    candidates={[{ id: "mina", label: "미나" }]} emptyMessage="없어요" listLabel="사람" />;
}

it("Mentions keeps the Combobox popover edge padding, not the helper's 16", async () => {
  await render(<MentionsFixture />);
  const field = container.querySelector("textarea")!;
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;
  await act(async () => {
    setter.call(field, "@");
    field.setSelectionRange(1, 1);
    field.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const list = document.body.querySelector<HTMLElement>('[role="listbox"]')!;
  // The anchor overhangs the left edge, so the list clamps to the collision padding.
  Object.defineProperty(field, "getBoundingClientRect", { configurable: true, value: () => rect(-40, 100, 200, 44) });
  Object.defineProperty(list, "getBoundingClientRect", { configurable: true, value: () => rect(0, 0, 200, 60) });
  Object.defineProperty(list, "scrollWidth", { configurable: true, value: 200 });
  Object.defineProperty(list, "scrollHeight", { configurable: true, value: 60 });
  await act(async () => window.dispatchEvent(new Event("resize")));
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 20)); });
  // Before: 16 from the edge and 8 below the field (helper defaults).
  expect(list.style.left).toBe(px(comboboxRecipe.popover.collisionPadding));
  expect(list.style.top).toBe(px(144 + comboboxRecipe.popover.sideOffset));
});

it("DatePicker triggers use datePickerRecipe.sizes heights", async () => {
  const grid = { cells: Array.from({ length: 7 }, (_, index) => ({ date: `2026-09-0${index + 1}` })), weekdayLabels: ["일", "월", "화", "수", "목", "금", "토"] as const, todayDate: "2026-09-01" };
  await render(<>
    <DatePicker descriptor={{ grid, label: "날짜", displayValue: null, placeholder: "선택" }} monthLabel="9월" clearLabel="지우기" closeLabel="닫기" composeAccessibleName={({ date }) => date} />
    <DatePicker size="large" descriptor={{ grid, label: "크게", displayValue: null, placeholder: "선택" }} monthLabel="9월" clearLabel="지우기" closeLabel="닫기" composeAccessibleName={({ date }) => date} />
  </>);
  const [medium, large] = [...container.querySelectorAll(".hjm-date-picker__trigger")];
  expect(medium!.getBoundingClientRect().height).toBe(datePickerRecipe.sizes.medium.minHeight);
  // Before: 56 (3.5rem).
  expect(large!.getBoundingClientRect().height).toBe(datePickerRecipe.sizes.large.minHeight);
});

it("MessageComposer rows sit screenPatternRecipe.itemGap apart", async () => {
  await render(<MessageComposer label="메시지" sendLabel="보내기" value="" onValueChange={() => undefined} onSend={() => undefined} context={<p>답장 중</p>} />);
  const composer = container.querySelector(".hjm-message-composer")!;
  // Before: 8 (space-xs) for both.
  expect(css(composer).rowGap).toBe(px(screenPatternRecipe.itemGap));
  expect(css(composer.querySelector(".hjm-message-composer__row")!).columnGap).toBe(px(screenPatternRecipe.itemGap));
});

it("Statistic text follows statisticRecipe variants per density", async () => {
  await render(<>
    <Statistic descriptor={{ id: "a", label: "걸음", value: "1,200", suffix: "보", hint: "어제보다", trend: { direction: "up", tone: "success", label: "+5%" } }} />
    <Statistic descriptor={{ id: "b", label: "거리", value: "3" }} density="compact" />
  </>);
  const [comfortable, compact] = [...container.querySelectorAll(".hjm-statistic")];
  const size = (scope: Element, slot: string) => css(scope.querySelector(`.hjm-statistic__${slot}`)!).fontSize;
  // Before: label body 14 medium, value title 18 at both densities, affix muted.
  expect(size(comfortable!, "label")).toBe(px(typography[statisticRecipe.density.comfortable.labelVariant].fontSize));
  expect(css(comfortable!.querySelector(".hjm-statistic__label")!).fontWeight).toBe(statisticRecipe.label.fontWeight);
  expect(size(comfortable!, "value")).toBe(px(typography[statisticRecipe.density.comfortable.valueVariant].fontSize));
  expect(css(comfortable!.querySelector(".hjm-statistic__value")!).fontWeight).toBe(statisticRecipe.value.fontWeight);
  expect(size(comfortable!, "affix")).toBe(px(typography[statisticRecipe.affix.textVariant].fontSize));
  expect(size(comfortable!, "hint")).toBe(px(typography[statisticRecipe.hint.textVariant].fontSize));
  expect(size(comfortable!, "trend")).toBe(px(typography[statisticRecipe.trend.textVariant].fontSize));
  expect(size(compact!, "label")).toBe(px(typography[statisticRecipe.density.compact.labelVariant].fontSize));
  expect(size(compact!, "value")).toBe(px(typography[statisticRecipe.density.compact.valueVariant].fontSize));
});
