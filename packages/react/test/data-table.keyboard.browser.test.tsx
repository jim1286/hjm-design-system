import { act, useState } from "react";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it } from "vitest";
import type { DataTableSortState } from "@hjmds/design-contracts/components/data-table";
import { DataTable } from "../src/data-table.js";
import { HjmProvider } from "../src/provider.js";
import { defaultRenderFixtures } from "./default-render-fixtures.js";
import "../src/styles.css";

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

function Fixture() {
  const [sortState, setSortState] = useState<DataTableSortState<string>>(null);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  return (
    <HjmProvider reducedMotion>
      <DataTable
        columns={[{ id: "name", header: "이름" }, { id: "date", header: "날짜", sortable: true }]}
        rows={[{ id: "first" }, { id: "second" }, { id: "locked", disabled: true }]}
        labels={{
          table: "기록 표",
          selectAll: "모두 선택",
          selectRow: (id) => `${id} 선택`,
          sortColumn: (header, direction) => `${header} 정렬${direction ? direction.direction : ""}`,
        }}
        renderCell={(rowId, columnId) => `${rowId} ${columnId}`}
        sortState={sortState}
        onSortChange={setSortState}
        selection={{ mode: "multiple", selectedKeys: selected, onSelectionChange: setSelected }}
      />
    </HjmProvider>
  );
}

const control = (label: string) => host.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;

it("supports native Tab order and Enter/Space activation for sorting and selection", async () => {
  await act(async () => root.render(<Fixture />));
  const sort = control("날짜 정렬");
  const selectAll = control("모두 선택");
  const first = control("first 선택");
  const second = control("second 선택");

  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(selectAll);
  await act(async () => userEvent.keyboard("{Space}"));
  expect(selectAll.getAttribute("aria-checked")).toBe("true");
  expect(document.activeElement).toBe(selectAll);

  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(sort);
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(host.querySelector("th[aria-sort=ascending]")).not.toBeNull();
  expect(document.activeElement).toBe(sort);

  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(first);
  await act(async () => userEvent.keyboard("{Space}"));
  expect(first.getAttribute("aria-checked")).toBe("false");
  expect(selectAll.getAttribute("aria-checked")).toBe("mixed");
  expect(document.activeElement).toBe(first);

  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(second);
});

it("wraps long cell copy inside a narrow table instead of widening its container", async () => {
  const fixture = defaultRenderFixtures.find(({ componentId }) => componentId === "data-table")!;
  const copy = "An unusually long product sentence with verylongunbrokenidentifierlikewordsthatmustwrap and a second clause that keeps going past one line.";
  host.style.width = "320px";
  await act(async () => root.render(fixture.renderLongCopy!(copy)));
  const table = host.querySelector<HTMLElement>(".hjm-data-table__table")!;
  const cell = host.querySelector<HTMLElement>("tbody td")!;
  expect(cell.textContent).toContain(copy);
  expect(cell.scrollWidth).toBeLessThanOrEqual(cell.clientWidth + 2);
  expect(table.getBoundingClientRect().width).toBeLessThanOrEqual(host.clientWidth + 1);
});
