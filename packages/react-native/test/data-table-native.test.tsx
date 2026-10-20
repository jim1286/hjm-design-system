import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it } from "vitest";
import { sortDataTableRows, toDataTableSortValue, type DataTableSortState } from "@hjmds/design-contracts/components/data-table";
import { DataTable } from "../src/data-table.js";
import { HjmNativeProvider } from "../src/provider.js";
import { View } from "react-native";
import { useState } from "react";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const data: Record<string, Record<string, string>> = { a: { name: "구자욱", avg: ".361" }, b: { name: "레이예스", avg: ".351" }, c: { name: "신인", avg: "—" } };
const columns = [{ id: "name", header: "선수", pinned: "start" as const }, { id: "avg", header: "타율", align: "end" as const, sortable: true, sortDescFirst: true }];

it("starts descending for sortDescFirst, pins the name column and pages rows by product order", () => {
  const sorts: DataTableSortState<string>[] = [], pressed: string[] = [];
  let tree!: ReactTestRenderer;
  const rows = sortDataTableRows(["c", "b", "a"].map(id => ({ id })), { columnId: "avg", direction: "descending" }, (row, column) => toDataTableSortValue(data[row.id]![column]));
  act(() => { tree = create(<HjmNativeProvider><DataTable columns={columns} rows={rows} labels={{ table: "타율 순위", sortColumn: (header, s) => `${header} ${s?.direction ?? "정렬 안 됨"}` }}
    renderCell={(row, column) => data[row]![column]!} onSortChange={s => sorts.push(s)} onRowPress={id => pressed.push(id)} summaryRow={column => column === "name" ? "평균" : ".356"} /></HjmNativeProvider>); });
  try {
    act(() => tree.root.find(n => n.props.accessibilityLabel === "타율 정렬 안 됨").props.onPress());
    expect(sorts).toEqual([{ columnId: "avg", direction: "descending" }]);
    const rowButtons = tree.root.findAll(n => typeof n.type === "string" && n.props.accessibilityRole === "button" && n.props.accessible === true && typeof n.props.accessibilityLabel === "string" && n.props.accessibilityLabel.startsWith("선수"));
    expect(rowButtons.map(n => n.props.accessibilityLabel)).toEqual(["선수 구자욱, 타율 .361", "선수 레이예스, 타율 .351", "선수 신인, 타율 —"]);
    act(() => rowButtons[1]!.props.onPress());
    expect(pressed).toEqual(["b"]);
    expect(tree.root.findAll(n => n.props.children === "평균").length).toBeGreaterThan(0);
  } finally { act(() => tree.unmount()); }
});

it("fits full sortable headers and innings values in both header and body columns", () => {
  let tree!: ReactTestRenderer;
  function Table() {
    const [sort, setSort] = useState<DataTableSortState<string>>(null);
    return <DataTable
    columns={[{ id: "season", header: "시즌", width: 80, pinned: "start" }, { id: "ip", header: "이닝", width: 54 }, { id: "era", header: "평균자책점", width: 54, sortable: true }]}
    rows={[{ id: "total" }]} labels={{ table: "투수 통산", sortColumn: header => `${header} 정렬` }}
    renderCell={(_, column) => ({ season: "통산", ip: "150 ⅓", era: "4.54" })[column]}
    sortState={sort} onSortChange={setSort} />;
  }
  act(() => { tree = create(<HjmNativeProvider><Table /></HjmNativeProvider>); });
  try {
    const measurement = (text: string, width: number) => act(() => tree.root.findAll(n => typeof n.props.onLayout === "function" && n.props.children === text)[0]!.props.onLayout({ nativeEvent: { layout: { width } } }));
    act(() => tree.root.findAllByType(View).find(n => n.props.accessibilityLabel === "투수 통산")!.props.onLayout({ nativeEvent: { layout: { width: 240 } } }));
    measurement("평균자책점 ▲\n평균자책점 ▼", 96);
    measurement("150 ⅓", 64);
    const header = tree.root.find(n => typeof n.type === "string" && n.props.accessibilityLabel === "평균자책점 정렬");
    expect(header.props.style.width).toBe(112);
    const cell = tree.root.findAll(n => typeof n.type === "string" && n.props.children === "150 ⅓" && n.props.onLayout === undefined)[0]!;
    let cellBox = cell.parent;
    while (cellBox && typeof cellBox.props.style?.width !== "number") cellBox = cellBox.parent;
    expect(cellBox!.props.style.width).toBe(80);
    expect(cellBox!.props.style.flexShrink).toBe(0);
    // Sorting can add an arrow without changing the space reserved for the header.
    act(() => header.props.onPress());
    expect(header.props.style.width).toBe(112);
    expect(tree.root.findAll(n => typeof n.type === "string" && Array.isArray(n.props.children) && n.props.children.join("") === "평균자책점 ▲").length).toBeGreaterThan(0);
  } finally { act(() => tree.unmount()); }
});


it.each([true, false])("names rich-cell rows once and preserves activation, pinned=%s", pinned => {
  let tree!: ReactTestRenderer;
  const pressed: string[] = [];
  const richColumns = columns.map(column => { const { pinned: _pinned, ...unpinned } = column; return pinned ? column : unpinned; });
  act(() => { tree = create(<HjmNativeProvider><DataTable columns={richColumns} rows={[{ id: "a" }]}
    labels={{ table: "선수 기록", sortColumn: header => header }}
    renderCell={(row, column) => column === "name" ? <View accessibilityLabel={data[row]!.name} /> : data[row]![column]!}
    getCellText={(row, column) => column === "name" ? data[row]!.name : undefined}
    onRowPress={id => pressed.push(id)} /></HjmNativeProvider>); });
  try {
    const named = tree.root.findAll(node => typeof node.type === "string" && node.props.accessible === true
      && node.props.accessibilityLabel === "선수 구자욱, 타율 .361");
    expect(named).toHaveLength(1);
    act(() => named[0]!.props.onPress());
    expect(pressed).toEqual(["a"]);
    const scrollingTargets = tree.root.findAll(node => typeof node.type === "string" && node.props.accessible === false && typeof node.props.onPress === "function");
    expect(scrollingTargets).toHaveLength(pinned ? 1 : 0);
    if (pinned) {
      const scrolling = scrollingTargets[0]!;
      expect(scrolling.props.accessibilityRole).toBeUndefined();
      expect(scrolling.props["aria-hidden"]).toBe(true);
      expect(scrolling.props.accessibilityElementsHidden).toBe(true);
      expect(scrolling.props.importantForAccessibility).toBe("no-hide-descendants");
      expect(scrolling.props.tabIndex).toBe(-1);
      expect(named[0]!.props.tabIndex).toBe(0);
      // Pointer activation on the visible stats still opens the same row.
      act(() => scrolling.props.onPress());
      expect(pressed).toEqual(["a", "a"]);
    }
  } finally { act(() => tree.unmount()); }
});
