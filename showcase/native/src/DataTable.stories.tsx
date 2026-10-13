import { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native";
import { DataTable } from "@hjmds/react-native/data-table";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { sortDataTableRows, toDataTableSortValue, type DataTableSortState } from "@hjmds/design-contracts/components/data-table";
import { chartCopy as copy, tableColumns, tableRows } from "../../shared/chart-examples";

/** Stat table: pinned name column, highest-first sort, whole-row selection and an average row. */
function Preview({ state }: { state?: "empty" }) {
  const [sort, setSort] = useState<DataTableSortState<string>>({ columnId: "ops", direction: "descending" });
  const [selected, setSelected] = useState<string | null>(null);
  const rows = useMemo(() => state === "empty" ? [] : sortDataTableRows(Object.keys(tableRows).map(id => ({ id })), sort, (row, column) => toDataTableSortValue(tableRows[row.id]![column])), [sort, state]);
  return <ScrollView><Stack gap="md">
    <Text variant="title">{copy.table}</Text>
    <DataTable columns={tableColumns} rows={rows} labels={{ table: copy.table, sortColumn: copy.sortColumn }} renderCell={(row, column) => tableRows[row]![column]!}
      sortState={sort} onSortChange={setSort} onRowPress={setSelected} selectedRowId={selected} emptyLabel={copy.missing}
      summaryRow={column => column === "name" ? copy.total : column === "avg" ? ".348" : column === "team" ? "" : "—"} />
  </Stack></ScrollView>;
}

const meta = { title: "배포/컴포넌트/데이터 표시/데이터 표", component: Preview } satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Empty: Story = { name: "비어 있음", args: { state: "empty" } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
