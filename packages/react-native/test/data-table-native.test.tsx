import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it } from "vitest";
import { sortDataTableRows, toDataTableSortValue, type DataTableSortState } from "@hjmds/design-contracts/components/data-table";
import { DataTable } from "../src/data-table.js";
import { HjmNativeProvider } from "../src/provider.js";
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
