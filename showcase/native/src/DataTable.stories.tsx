import { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native";
import { DataTable } from "@hjmds/react-native/data-table";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { sortDataTableRows, toDataTableSortValue, type DataTableSortState } from "@hjmds/design-contracts/components/data-table";
import { percentileHeat, percentileRank } from "@hjmds/design-contracts/components/data-table";
import { chartCopy as copy, tableColumns, tableRows } from "../../shared/chart-examples";
import {
  heatColumns, hitterCell, hitterColumnGroups, hitterColumns, hitters, leagueHitters, lineup, lineupColumns, lineupGroups, lowerIsBetterColumns,
  tableFamilyCopy as family, type HitterRow,
} from "../../shared/table-examples";

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

const labels = (table: string) => ({ table, sortColumn: family.sortColumn });
const hitterById = (rows: readonly HitterRow[]) => new Map(rows.map(row => [row.id, row]));

/** 타격 | 주루 header bands above leaf columns. */
function HeaderBands() {
  const byId = hitterById(hitters);
  return <DataTable columns={hitterColumns} columnGroups={hitterColumnGroups} rows={hitters.map(({ id }) => ({ id }))} labels={labels(family.hitters)} renderCell={(row, column) => hitterCell(byId.get(row)!, column)} />;
}
/** 선발 / 교체 sections; pinch hitters indent one level under the lineup. */
function RowGroups() {
  const byId = new Map(lineup.map(row => [row.id, row]));
  return <DataTable columns={lineupColumns} rowGroups={lineupGroups} rows={lineup.map(({ id, depth }) => ({ id, ...(depth ? { depth } : {}) }))} labels={labels(family.lineup)} renderCell={(row, column) => String(byId.get(row)![column as keyof typeof lineup[number]] ?? "")} />;
}
/** Savant-style percentile heat within the shown rows; the single best value gets the leader tone. */
function Percentile() {
  const byId = hitterById(hitters);
  const style = (row: string, column: string) => {
    if (!(heatColumns as readonly string[]).includes(column)) return null;
    const value = Number(byId.get(row)![column as keyof HitterRow]), sample = hitters.map(item => Number(item[column as keyof HitterRow]));
    const lower = lowerIsBetterColumns.has(column), best = lower ? Math.min(...sample) : Math.max(...sample);
    return { heat: percentileHeat(percentileRank(value, sample, { lowerIsBetter: lower })), tone: value === best ? "leader" as const : null };
  };
  return <DataTable columns={hitterColumns} rows={hitters.map(({ id }) => ({ id }))} cellStyle={style} labels={labels(family.percentile)} renderCell={(row, column) => hitterCell(byId.get(row)!, column)} />;
}
/** Bounded body: the header stays while 25 rows scroll. */
function FixedHeader() {
  const byId = hitterById(leagueHitters);
  return <DataTable columns={hitterColumns} rows={leagueHitters.map(({ id }) => ({ id }))} maxBodyHeight={320} labels={labels(family.league)} renderCell={(row, column) => hitterCell(byId.get(row)!, column)} />;
}

const meta = { title: "배포/컴포넌트/데이터 표시/데이터 표", component: Preview } satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Empty: Story = { name: "비어 있음", args: { state: "empty" } };
export const HeaderBandsStory: Story = { name: "묶음 머리글", render: () => <HeaderBands /> };
export const RowGroupsStory: Story = { name: "행 묶음과 들여쓰기", render: () => <RowGroups /> };
export const PercentileStory: Story = { name: "백분위 색", render: () => <Percentile /> };
export const FixedHeaderStory: Story = { name: "고정 머리글", render: () => <FixedHeader /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
