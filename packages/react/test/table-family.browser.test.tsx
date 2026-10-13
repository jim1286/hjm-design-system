import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { percentileHeat, percentileRank, type DataTableSortState } from "@hjmds/design-contracts/components/data-table";
import { ComparisonTable, DataTable, LineScore, MatrixTable } from "../src/data-table.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

const labels = {
  table: "타자 기록",
  selectAll: "모두 선택",
  selectRow: (id: string) => `${id} 선택`,
  sortColumn: (header: string, _direction: DataTableSortState<string>) => `${header} 정렬`,
};
const columns = [
  { id: "name", header: "선수", pinned: "start" as const },
  { id: "avg", header: "타율", align: "end" as const },
  { id: "hr", header: "홈런", align: "end" as const },
  { id: "sb", header: "도루", align: "end" as const },
];
const stats: Record<string, Record<string, string | number>> = {
  kim: { name: "김도영", avg: ".347", hr: 38, sb: 40 },
  oh: { name: "오지환", avg: ".268", hr: 10, sb: 15 },
  park: { name: "박해민", avg: ".263", hr: 6, sb: 43 },
};
const render = async (node: React.ReactNode) => act(async () => root.render(<HjmProvider reducedMotion>{node}</HjmProvider>));

it("spans grouped leaf columns with a colgroup header and pads ungrouped columns", async () => {
  await render(
    <DataTable columns={columns} rows={[{ id: "kim" }]} labels={labels} renderCell={(row, column) => stats[row]![column]}
      columnGroups={[{ id: "bat", header: "타격", columns: ["avg", "hr"] }, { id: "run", header: "주루", columns: ["sb"] }]} />,
  );
  const bandRow = document.querySelector(".hjm-data-table__bands")!;
  const cells = [...bandRow.children] as HTMLTableCellElement[];
  expect(cells.map((cell) => [cell.tagName, cell.colSpan, cell.textContent])).toEqual([["TD", 1, ""], ["TH", 2, "타격"], ["TH", 1, "주루"]]);
  expect(cells[0]!.getAttribute("aria-hidden")).toBe("true");
  expect(cells[1]!.getAttribute("scope")).toBe("colgroup");
  // Leaf headers still form their own row below the bands.
  expect(document.querySelectorAll("thead tr")).toHaveLength(2);
});

it("renders a full-width rowgroup header per row group and indents sub-rows on the first cell", async () => {
  await render(
    <DataTable columns={columns} rows={[{ id: "kim" }, { id: "oh" }, { id: "park", depth: 1 }]} labels={labels}
      renderCell={(row, column) => stats[row]![column]}
      selection={{ mode: "multiple", defaultSelectedKeys: new Set<string>() }}
      rowGroups={[{ id: "start", label: "선발", rows: ["kim", "oh"] }, { id: "sub", label: "교체", rows: ["park"] }]} />,
  );
  const groups = [...document.querySelectorAll<HTMLTableCellElement>("th[scope='rowgroup']")];
  expect(groups.map((cell) => cell.textContent)).toEqual(["선발", "교체"]);
  // Selector column + four data columns.
  expect(groups[0]!.colSpan).toBe(5);
  expect(document.querySelectorAll("tbody")).toHaveLength(2);
  const indented = document.querySelector<HTMLTableCellElement>("td[data-depth='1']")!;
  expect(indented.textContent).toBe("박해민");
  const plain = [...document.querySelectorAll<HTMLTableCellElement>("tbody td")].find((cell) => cell.textContent === "김도영")!;
  expect(parseFloat(getComputedStyle(indented).paddingInlineStart) - parseFloat(getComputedStyle(plain).paddingInlineStart)).toBe(16);
});

it("paints percentile heat and leader tone from cellStyle", async () => {
  const sample = Object.values(stats).map((row) => Number(row.hr));
  await render(
    <DataTable columns={columns} rows={[{ id: "kim" }, { id: "oh" }, { id: "park" }]} labels={labels}
      renderCell={(row, column) => stats[row]![column]}
      heatColors={{ high: "rgb(255, 0, 0)", low: "rgb(0, 0, 255)" }}
      cellStyle={(row, column) => column === "hr"
        ? { heat: percentileHeat(percentileRank(Number(stats[row]!.hr), sample)), tone: row === "kim" ? "leader" : null }
        : null} />,
  );
  const cell = (text: string) => [...document.querySelectorAll<HTMLTableCellElement>("tbody td")].find((node) => node.textContent === text)!;
  expect(cell("38").dataset.heat).toBe("high-3");
  expect(cell("38").dataset.tone).toBe("leader");
  expect(getComputedStyle(cell("38")).backgroundImage).toContain("linear-gradient");
  expect(getComputedStyle(cell("38")).fontWeight).toBe("700");
  expect(cell("6").dataset.heat).toBe("low-3");
  // The middle of the sample stays neutral.
  expect(cell("10").dataset.heat).toBeUndefined();
});

it("bounds the scroll box and keeps the header fixed while pinned columns still stick", async () => {
  const many = Array.from({ length: 25 }, (_, i) => ({ id: `p${i}` }));
  await render(
    <DataTable columns={columns} rows={many} labels={labels} maxBodyHeight={200} renderCell={(row, column) => `${row}-${column}`} />,
  );
  const scroll = document.querySelector<HTMLElement>(".hjm-data-table__scroll")!;
  expect(scroll.dataset.bounded).toBe("true");
  expect(scroll.getBoundingClientRect().height).toBeLessThanOrEqual(200);
  expect(getComputedStyle(document.querySelector("thead")!).position).toBe("sticky");
  expect(getComputedStyle(document.querySelector("tbody td")!).position).toBe("sticky");
  const headerTop = document.querySelector("thead")!.getBoundingClientRect().top;
  await act(async () => { scroll.scrollTop = 300; scroll.dispatchEvent(new Event("scroll")); });
  expect(document.querySelector("thead")!.getBoundingClientRect().top).toBe(headerTop);
});

it("line score pads to nine periods, extends for extra innings and marks the live period", async () => {
  const extra = [1, 0, 0, 2, 0, 0, 0, 1, 0, 0, 1];
  await render(
    <LineScore accessibilityLabel="LG 대 KIA 경기 점수" totals={["R", "H", "E", "B"]} currentPeriod={11}
      teams={[
        { id: "lg", name: "LG", periods: extra, totals: { R: 5, H: 11, E: 0, B: 3 } },
        { id: "kia", name: "KIA", periods: [0, 2, 0, 0, 1, 1, 0, 0, 0, 0], totals: { R: 4, H: 9, E: 1, B: 4 } },
      ]} />,
  );
  const table = document.querySelector("table[aria-label='LG 대 KIA 경기 점수']")!;
  const heads = [...table.querySelectorAll("thead th")].map((node) => node.textContent);
  expect(heads).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "R", "H", "E", "B"]);
  const live = table.querySelector("th[aria-current='true']")!;
  expect(live.textContent).toBe("11");
  expect(table.querySelectorAll("th[scope='row']")).toHaveLength(2);
  expect(table.querySelector("tr[data-leader] th")!.textContent).toBe("LG");
  // KIA has not batted in the 11th yet: blank, not zero.
  const kiaCells = [...table.querySelectorAll("tbody tr")[1]!.querySelectorAll("td")];
  expect(kiaCells[10]!.textContent).toBe("");
});

it("matrix diagonal is a hidden blank self cell", async () => {
  const ids = ["lg", "kia", "ss"] as const;
  const names = { lg: "LG", kia: "KIA", ss: "삼성" };
  await render(
    <MatrixTable accessibilityLabel="상대 전적" ids={ids} labelOf={(id) => names[id]} highlightId="lg"
      getCell={(row, column) => ({ label: `${row}-${column}`, heat: row === "lg" && column === "kia" ? { side: "high", strength: 2 } : null })} />,
  );
  const self = [...document.querySelectorAll<HTMLTableCellElement>("td.hjm-matrix-table__self")];
  expect(self).toHaveLength(3);
  expect(self.every((cell) => cell.getAttribute("aria-hidden") === "true" && cell.textContent === "")).toBe(true);
  expect(document.querySelectorAll("th[scope='col']")).toHaveLength(3);
  expect(document.querySelector("tr[data-highlighted] th")!.textContent).toBe("LG");
  expect(document.querySelector("td[data-heat='high-2']")!.textContent).toBe("lg-kia");
});

it("comparison rows favor the better side, including lower-is-better stats", async () => {
  await render(
    <ComparisonTable accessibilityLabel="선발 투수 비교"
      sides={[{ name: "LG", color: "rgb(195, 4, 82)" }, { name: "KIA", color: "rgb(234, 0, 41)" }]}
      rows={[
        { id: "era", label: "평균자책", values: [2.89, 3.12], lowerIsBetter: true },
        { id: "so", label: "탈삼진", values: [150, 171] },
        { id: "w", label: "승", values: [12, 12] },
      ]} />,
  );
  const list = document.querySelector("section[aria-label='선발 투수 비교'] [role='list']")!;
  const items = [...list.querySelectorAll<HTMLLIElement>("li")];
  expect(items.map((item) => item.dataset.winner)).toEqual(["0", "1", undefined]);
  expect(items[0]!.querySelector(".hjm-visually-hidden")!.textContent).toBe("평균자책 LG 2.89, KIA 3.12");
  const [left, right] = [...items[0]!.querySelectorAll<HTMLElement>(".hjm-comparison-table__bar")];
  expect(parseFloat(left!.style.inlineSize)).toBeGreaterThan(parseFloat(right!.style.inlineSize));
});
