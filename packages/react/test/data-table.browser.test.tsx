import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { DataTableSelection, DataTableSortState } from "@hjmds/design-contracts/components/data-table";
import { DataTable } from "../src/data-table.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
import { hasHitArea, tap, tapAt } from "./touch-tap.js";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

const columns = [
  { id: "title", header: "제목" },
  { id: "day", header: "날짜", sortable: true },
];
const rows = [{ id: "walk" }, { id: "meal" }, { id: "locked", disabled: true }];
const cells: Record<string, Record<string, string>> = {
  walk: { title: "느리게 걸었던 오후", day: "9월 12일" },
  meal: { title: "함께 먹은 저녁", day: "9월 14일" },
  locked: { title: "잠긴 기록", day: "9월 15일" },
};
const labels = {
  table: "기록 표",
  selectAll: "모두 선택",
  selectRow: (id: string) => `${cells[id]!.title} 선택`,
  sortColumn: (header: string, direction: DataTableSortState<string>) =>
    `${header} 정렬${direction ? (direction.direction === "ascending" ? ", 오름차순" : ", 내림차순") : ""}`,
};

const header = (name: string) => [...document.querySelectorAll<HTMLElement>("th")].find((node) => node.textContent?.includes(name))!;
const check = (label: string) => document.querySelector<HTMLElement>(`[aria-label="${label}"]`)!;
const rowOf = (title: string) => [...document.querySelectorAll<HTMLElement>("tbody tr")].find((node) => node.textContent?.includes(title))!;

function Fixture({ onSort, multiple = true }: { onSort?: (state: DataTableSortState<string>) => void; multiple?: boolean }) {
  const [sortState, setSortState] = useState<DataTableSortState<string>>(null);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [single, setSingle] = useState<string | null>(null);
  return (
    <HjmProvider reducedMotion>
      <DataTable
        columns={columns}
        rows={rows}
        labels={labels}
        renderCell={(rowId, columnId) => cells[rowId]![columnId]}
        sortState={sortState}
        onSortChange={(next) => { setSortState(next); onSort?.(next); }}
        selection={multiple
          ? { mode: "multiple", selectedKeys: selected, onSelectionChange: setSelected }
          : { mode: "single", selectedKey: single, onSelectionChange: setSingle }}
      />
    </HjmProvider>
  );
}

it("puts the sort control inside the header and passes the direction to aria-sort", async () => {
  const onSort = vi.fn();
  await act(async () => root.render(<Fixture onSort={onSort} />));
  // Only the sortable column gets a button; the header cell itself is not one.
  expect(header("제목").querySelector("button")).toBeNull();
  const sortButton = header("날짜").querySelector("button")!;
  expect(header("날짜").hasAttribute("aria-sort")).toBe(false);
  await act(async () => sortButton.click());
  expect(header("날짜").getAttribute("aria-sort")).toBe("ascending");
  expect(header("날짜").querySelector("button")!.getAttribute("aria-label")).toBe("날짜 정렬, 오름차순");
  await act(async () => header("날짜").querySelector("button")!.click());
  expect(header("날짜").getAttribute("aria-sort")).toBe("descending");
  // Three-state by default: the third press clears the sort entirely.
  await act(async () => header("날짜").querySelector("button")!.click());
  expect(header("날짜").hasAttribute("aria-sort")).toBe(false);
  expect(onSort.mock.calls.map(([state]) => state?.direction ?? null)).toEqual(["ascending", "descending", null]);
});

it("keeps select-all tri-state and excludes disabled rows from the accounting", async () => {
  await act(async () => root.render(<Fixture />));
  expect(check("모두 선택").getAttribute("aria-checked")).toBe("false");
  await act(async () => check("느리게 걸었던 오후 선택").click());
  expect(check("모두 선택").getAttribute("aria-checked")).toBe("mixed");
  await act(async () => check("함께 먹은 저녁 선택").click());
  // Two enabled rows are the whole denominator, so the header reads as checked.
  expect(check("모두 선택").getAttribute("aria-checked")).toBe("true");
  await act(async () => check("잠긴 기록 선택").click());
  expect(check("잠긴 기록 선택").getAttribute("aria-checked")).toBe("false");
  await act(async () => check("모두 선택").click());
  expect(check("느리게 걸었던 오후 선택").getAttribute("aria-checked")).toBe("false");
  expect(rowOf("느리게 걸었던 오후").getAttribute("aria-selected")).toBe("false");
});

it("uses radio semantics for a single-selection table", async () => {
  await act(async () => root.render(<Fixture multiple={false} />));
  expect(document.querySelector('[role="checkbox"]')).toBeNull();
  const control = check("함께 먹은 저녁 선택");
  expect(control.getAttribute("role")).toBe("radio");
  await act(async () => control.click());
  expect(check("함께 먹은 저녁 선택").getAttribute("aria-checked")).toBe("true");
  await act(async () => check("느리게 걸었던 오후 선택").click());
  expect(check("함께 먹은 저녁 선택").getAttribute("aria-checked")).toBe("false");
});

it("keeps an uncontrolled default selection in its own state for single and multiple tables", async () => {
  const render = (selection: DataTableSelection<string>) => root.render(
    <HjmProvider reducedMotion>
      <DataTable columns={columns} rows={rows} labels={labels} renderCell={(rowId, columnId) => cells[rowId]![columnId]}
        selection={selection} />
    </HjmProvider>,
  );
  const onSingle = vi.fn();
  await act(async () => render({ mode: "single", defaultSelectedKey: "walk", onSelectionChange: onSingle }));
  expect(check("느리게 걸었던 오후 선택").getAttribute("aria-checked")).toBe("true");
  await act(async () => check("함께 먹은 저녁 선택").click());
  expect(onSingle.mock.calls).toEqual([["meal"]]);
  expect(check("함께 먹은 저녁 선택").getAttribute("aria-checked")).toBe("true");
  expect(check("느리게 걸었던 오후 선택").getAttribute("aria-checked")).toBe("false");
  await act(async () => root.unmount());
  root = createRoot(host);

  const onMultiple = vi.fn();
  await act(async () => render({ mode: "multiple", defaultSelectedKeys: new Set(["walk"]), onSelectionChange: onMultiple }));
  expect(check("모두 선택").getAttribute("aria-checked")).toBe("mixed");
  await act(async () => check("함께 먹은 저녁 선택").click());
  expect(check("모두 선택").getAttribute("aria-checked")).toBe("true");
  expect(rowOf("함께 먹은 저녁").getAttribute("aria-selected")).toBe("true");
  await act(async () => check("모두 선택").click());
  expect(check("느리게 걸었던 오후 선택").getAttribute("aria-checked")).toBe("false");
  expect(onMultiple).toHaveBeenCalledTimes(2);
});

it("leaves a controlled selection to its owner even when the owner ignores the change", async () => {
  const ignored = vi.fn();
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <DataTable columns={columns} rows={rows} labels={labels} renderCell={(rowId, columnId) => cells[rowId]![columnId]}
        selection={{ mode: "single", selectedKey: null, onSelectionChange: ignored }} />
    </HjmProvider>,
  ));
  await act(async () => check("함께 먹은 저녁 선택").click());
  expect(ignored.mock.calls).toEqual([["meal"]]);
  expect(check("함께 먹은 저녁 선택").getAttribute("aria-checked")).toBe("false");
});

it("exposes at most one focusable control per data cell and keeps native tab order", async () => {
  await act(async () => root.render(<Fixture />));
  for (const cell of document.querySelectorAll<HTMLElement>("tbody td")) {
    expect(cell.querySelectorAll("button, a[href], input").length).toBeLessThanOrEqual(1);
  }
  // No roving tabindex: every control is a plain tab stop.
  expect([...document.querySelectorAll<HTMLElement>("tbody button")].every((node) => node.tabIndex === 0)).toBe(true);
});

it("announces the table's async state without replacing the rows", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <DataTable
        columns={columns}
        rows={rows}
        labels={labels}
        renderCell={(rowId, columnId) => cells[rowId]![columnId]}
        asyncState={{ status: "error", message: "표를 불러오지 못했어요" }}
        footer={<p>3개 중 3개</p>}
      />
    </HjmProvider>,
  ));
  const state = document.querySelector<HTMLElement>(".hjm-data-table__state")!;
  expect(state.getAttribute("role")).toBe("alert");
  expect(state.textContent).toBe("표를 불러오지 못했어요");
  expect(document.querySelectorAll("tbody tr")).toHaveLength(3);
  // Pagination-like chrome is composed beneath the table, not owned by it.
  expect(document.querySelector(".hjm-data-table__footer")!.textContent).toBe("3개 중 3개");
});

// 2026-09-30 responsive audit WR-0930-5: the selection marks hit 16x16 and the
// sort button 36px wide, below the table's own minTouchTarget contract.
it("gives selection checkboxes and sort buttons a 44px hit area", async () => {
  // Keep the marks away from the iframe edge so every sampled point is on screen.
  await page.viewport(900, 720);
  host.style.padding = "32px";
  const onSort = vi.fn();
  await act(async () => root.render(<Fixture onSort={onSort} />));
  const selectAll = check("모두 선택");
  const walk = check("느리게 걸었던 오후 선택");
  const sort = header("날짜").querySelector("button")!;
  expect(hasHitArea(selectAll)).toBe(true);
  expect(hasHitArea(walk)).toBe(true);
  expect(hasHitArea(sort)).toBe(true);
  // A tap 20px off the mark's centre, inside the selection cell, still toggles it.
  const rect = walk.getBoundingClientRect();
  const frame = window.frameElement?.getBoundingClientRect();
  const scale = frame ? frame.width / window.innerWidth : 1;
  await act(async () => tapAt((frame?.left ?? 0) + (rect.left + rect.width / 2) * scale, (frame?.top ?? 0) + (rect.top + rect.height / 2 + 14) * scale));
  expect(walk.getAttribute("aria-checked")).toBe("true");
  await act(async () => tap(sort));
  expect(onSort).toHaveBeenCalledOnce();
});

// 2026-10-14 stat-table additions: sortDescFirst, pinned start columns, summary row.
const statColumns = [
  { id: "name", header: "선수", pinned: "start" as const, width: 120 },
  { id: "team", header: "팀", width: 240 },
  { id: "avg", header: "타율", align: "end" as const, sortable: true, sortDescFirst: true, width: 240 },
  { id: "so", header: "삼진", align: "end" as const, sortable: true, width: 240 },
];
const statCells: Record<string, Record<string, string>> = {
  koo: { name: "구자욱", team: "삼성", avg: ".361", so: "71" },
  aus: { name: "오스틴", team: "LG", avg: ".340", so: "88" },
};
function StatFixture({ onSort }: { onSort: (state: DataTableSortState<string>) => void }) {
  const [sortState, setSortState] = useState<DataTableSortState<string>>(null);
  return (
    <HjmProvider reducedMotion>
      <div style={{ inlineSize: 320 }}>
        <DataTable
          columns={statColumns}
          rows={[{ id: "koo" }, { id: "aus" }]}
          labels={{ ...labels, selectRow: (id) => `${statCells[id]!.name} 선택` }}
          renderCell={(rowId, columnId) => statCells[rowId]![columnId]}
          sortState={sortState}
          onSortChange={(next) => { setSortState(next); onSort(next); }}
          selection={{ mode: "single", defaultSelectedKey: null }}
          summaryRow={(columnId) => columnId === "name" ? "평균" : columnId === "avg" ? ".351" : null}
        />
      </div>
    </HjmProvider>
  );
}

it("starts sortDescFirst columns descending and keeps the default for others", async () => {
  const onSort = vi.fn();
  await act(async () => root.render(<StatFixture onSort={onSort} />));
  await act(async () => header("타율").querySelector("button")!.click());
  await act(async () => header("타율").querySelector("button")!.click());
  await act(async () => header("타율").querySelector("button")!.click());
  await act(async () => header("삼진").querySelector("button")!.click());
  expect(onSort.mock.calls.map(([state]) => state?.direction ?? null)).toEqual(["descending", "ascending", null, "ascending"]);
});

it("keeps pinned start columns and the selector visible while the table scrolls", async () => {
  await act(async () => root.render(<StatFixture onSort={() => undefined} />));
  const scroller = document.querySelector<HTMLElement>(".hjm-data-table__scroll")!;
  expect(scroller).not.toBeNull();
  const nameHeader = header("선수");
  expect(getComputedStyle(nameHeader).position).toBe("sticky");
  expect(nameHeader.classList.contains("hjm-data-table__pinned-edge")).toBe(true);
  // The pinned column starts after the (also sticky) selection column.
  const selector = document.querySelector<HTMLElement>("thead .hjm-data-table__selector")!;
  expect(parseFloat(nameHeader.style.insetInlineStart)).toBeCloseTo(selector.getBoundingClientRect().width, 0);
  expect(header("팀").classList.contains("hjm-data-table__pinned")).toBe(false);
  const before = nameHeader.getBoundingClientRect().left;
  await act(async () => { scroller.scrollLeft = 200; scroller.dispatchEvent(new Event("scroll")); });
  expect(scroller.scrollLeft).toBeGreaterThan(0);
  expect(nameHeader.getBoundingClientRect().left).toBeCloseTo(before, 0);
});

it("renders the product's summary row in tfoot", async () => {
  await act(async () => root.render(<StatFixture onSort={() => undefined} />));
  const cells = [...document.querySelectorAll("tfoot td")].map((cell) => cell.textContent);
  // Selector placeholder, then one cell per column.
  expect(cells).toEqual(["", "평균", "", ".351", ""]);
});

it("keeps the original DOM for tables without pinned columns", async () => {
  await act(async () => root.render(<Fixture />));
  expect(document.querySelector(".hjm-data-table__scroll")).toBeNull();
  expect(document.querySelector("tfoot")).toBeNull();
});
