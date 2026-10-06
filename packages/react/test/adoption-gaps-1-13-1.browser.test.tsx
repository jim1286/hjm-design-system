// 1.13.1 patch: gaps found while utilverse adopted HJM 1.13.0 (2026-10-06). Web twin of
// packages/react-native/test/adoption-gaps-1-13-1.test.tsx; the Chip and fixed Sheet gaps were Native-only.
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page, userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it } from "vitest";
import { containerRecipe } from "@hjmds/design-contracts/components/container";
import { HjmProvider } from "../src/provider.js";
import { Chip, SegmentedControl } from "../src/selection.js";
import { SearchScreen } from "../src/screen-flows.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

const themes = ["전체", "시간", "계산", "사진", "글자", "단위", "생활"].map((label, index) => ({ value: `t${index}`, label }));
const tops = (nodes: Iterable<Element>) => new Set(Array.from(nodes, (node) => Math.round(node.getBoundingClientRect().top)));

it("keeps pills in a row at large text and one line inside the scroll rail, while connected still stacks", async () => {
  await act(async () => root.render(<HjmProvider textScale={2}><div style={{ inlineSize: "900px" }}>
    <SegmentedControl label="주제" presentation="pills" size="small" items={themes.slice(0, 3)} defaultValue="t0" />
  </div></HjmProvider>));
  expect(tops(host.querySelectorAll(".hjm-segmented__item")).size).toBe(1);
  await act(async () => root.render(<HjmProvider textScale={2}><div style={{ inlineSize: "320px", blockSize: "600px" }}>
    <SearchScreen title="검색" queryLabel="검색어" queryClearLabel="지우기" query="" onQueryChange={() => {}} onSearch={() => {}} filtersOverflow="scroll"
      filters={<SegmentedControl label="주제" presentation="pills" size="small" items={themes} defaultValue="t0" />}>{null}</SearchScreen>
  </div></HjmProvider>));
  const rail = host.querySelector<HTMLElement>(".hjm-search-screen__filters")!;
  expect(tops(rail.querySelectorAll(".hjm-segmented__item")).size).toBe(1);
  expect(rail.scrollWidth).toBeGreaterThan(rail.clientWidth);
  // Arrow keys still move the single selection inside the rail.
  const first = rail.querySelector<HTMLInputElement>('input[value="t0"]')!; first.focus();
  await act(async () => { await userEvent.keyboard("{ArrowRight}"); });
  expect(rail.querySelector<HTMLInputElement>('input[value="t1"]')!.checked).toBe(true);
  expect(document.activeElement).toBe(rail.querySelector('input[value="t1"]'));
  await act(async () => root.render(<HjmProvider textScale={2}><div style={{ inlineSize: "900px" }}>
    <SegmentedControl label="보기" items={themes.slice(0, 3)} defaultValue="t0" />
  </div></HjmProvider>));
  expect(tops(host.querySelectorAll(".hjm-segmented__item")).size).toBe(3);
});

it("grows a chip with its label at large text (Native now matches)", async () => {
  await act(async () => root.render(<HjmProvider textScale={2}><Chip label="필터" onPress={() => {}} /></HjmProvider>));
  const chip = host.querySelector<HTMLElement>(".hjm-chip")!;
  const label = chip.querySelector<HTMLElement>(".hjm-chip__label") ?? chip;
  expect(chip.getBoundingClientRect().height).toBeGreaterThanOrEqual(label.getBoundingClientRect().height);
});

function Picks({ twoStep }: { twoStep: boolean }) {
  const [query, setQuery] = useState(""), [committed, setCommitted] = useState("");
  const shared = { title: "검색", queryLabel: "검색어", queryClearLabel: "지우기", query, onQueryChange: setQuery, onSearch: () => {},
    recentQueries: { items: ["카페"], title: "최근 검색", clearAllLabel: "전체 삭제", onClearAll: () => {}, removeLabel: (item: string) => `${item} 삭제`, onRemove: () => {} },
    suggestedQueries: { title: "추천", items: ["산책"] } };
  const results = <p>결과 목록</p>;
  return twoStep ? <SearchScreen {...shared} committedQuery={committed} onSubmit={setCommitted}>{results}</SearchScreen> : <SearchScreen {...shared}>{results}</SearchScreen>;
}

it("moves focus from a picked query to the results region instead of dropping it to the page", async () => {
  for (const twoStep of [true, false]) {
    await act(async () => root.render(<HjmProvider><Picks twoStep={twoStep} /></HjmProvider>));
    await page.getByRole("button", { name: twoStep ? "카페" : "산책", exact: true }).click();
    const results = host.querySelector<HTMLElement>(".hjm-search-screen__results")!;
    expect(results).not.toBeNull();
    expect(document.activeElement).toBe(results);
    // Focus left the field, so a mobile browser closes its on-screen keyboard as Native does.
    expect(document.activeElement).not.toBe(host.querySelector('input[type="search"]'));
    expect(results.textContent).toContain("결과 목록");
    await act(async () => root.render(<></>));
  }
});

it("keeps focus in the field when the query is committed with Enter", async () => {
  await act(async () => root.render(<HjmProvider><Picks twoStep /></HjmProvider>));
  await page.getByRole("searchbox", { name: "검색어" }).fill("산책");
  const input = host.querySelector<HTMLInputElement>('input[type="search"]')!; input.focus();
  await act(async () => { await userEvent.keyboard("{Enter}"); });
  expect(host.textContent).toContain("결과 목록");
  expect(document.activeElement).toBe(input);
});

it("bleeds the scroll rail over the host gutter when the screen has no inset of its own", async () => {
  const gutter = containerRecipe.gutters.regular;
  await act(async () => root.render(<HjmProvider><div className="host" style={{ inlineSize: "360px", blockSize: "600px", paddingInline: `${gutter}px`, boxSizing: "border-box" }}>
    <SearchScreen title="검색" queryLabel="검색어" queryClearLabel="지우기" query="" onQueryChange={() => {}} onSearch={() => {}} contentInset="none" hostGutter="regular"
      filtersOverflow="scroll" filters={<div style={{ display: "flex", gap: "8px" }}>{Array.from({ length: 8 }, (_, index) => <button key={index} type="button">{`조건 ${index + 1}`}</button>)}</div>}>{null}</SearchScreen>
  </div></HjmProvider>));
  const outer = host.querySelector<HTMLElement>(".host")!.getBoundingClientRect();
  const rail = host.querySelector<HTMLElement>(".hjm-search-screen__filters")!.getBoundingClientRect();
  expect(Math.round(rail.left)).toBe(Math.round(outer.left));
  expect(Math.round(rail.right)).toBe(Math.round(outer.right));
  const field = host.querySelector<HTMLElement>(".hjm-field")!.getBoundingClientRect();
  expect(Math.round(host.querySelector(".hjm-search-screen__filters button")!.getBoundingClientRect().left)).toBe(Math.round(field.left));
});
