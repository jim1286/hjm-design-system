import { useMemo } from "react";
import { percentileHeat, percentileRank } from "@hjmds/design-contracts/components/data-table";
import { ComparisonTable, DataTable, LineScore, MatrixTable } from "@hjmds/react/data-table";
import { Section, Stack } from "@hjmds/react/layout";
import {
  comparisonSides, finalGame, headToHeadCell, heatColumns, hitterCell, hitterColumnGroups, hitterColumns, hitters, kboTeamNames, kboTeams,
  leagueHitters, lineScoreTotals, lineup, lineupColumns, lineupGroups, liveGame, liveGamePeriod, lowerIsBetterColumns, pitcherComparison,
  tableFamilyCopy as copy, type HitterRow,
} from "../../../shared/table-examples";

// Web DataTable family showcase (2026-10-14). Data and copy come from the Web/Native shared fixtures.

const labels = (table: string) => ({ table, selectAll: "", selectRow: (id: string) => id, sortColumn: (header: string) => copy.sortColumn(header, null) });
const byId = (rows: readonly HitterRow[]) => new Map(rows.map((row) => [row.id, row]));

export function HeaderBandsPreview() {
  const rows = byId(hitters);
  return (
    <Section title={copy.hitters} description="타격과 주루 기록을 묶음 머리글로 나눠요.">
      <DataTable columns={hitterColumns} columnGroups={hitterColumnGroups} rows={hitters.map(({ id }) => ({ id }))} labels={labels(copy.hitters)}
        renderCell={(rowId, columnId) => hitterCell(rows.get(rowId)!, columnId)} />
    </Section>
  );
}

export function RowGroupsPreview() {
  const rows = new Map(lineup.map((row) => [row.id, row]));
  return (
    <Section title={copy.lineup} description="선발과 교체를 행 묶음으로 나누고, 교체 선수는 한 단계 들여 써요.">
      <DataTable columns={lineupColumns} rowGroups={lineupGroups} rows={lineup.map(({ id, depth }) => (depth ? { id, depth } : { id }))} labels={labels(copy.lineup)}
        renderCell={(rowId, columnId) => String(rows.get(rowId)![columnId as keyof (typeof lineup)[number]] ?? "")} />
    </Section>
  );
}

/** Savant-style percentile heat per stat column; the column leader also gets the leader tone. */
export function PercentilePreview() {
  const rows = byId(hitters);
  const style = useMemo(() => {
    const samples = new Map(heatColumns.map((column) => [column, hitters.map((row) => row[column])]));
    return (rowId: string, columnId: string) => {
      const sample = samples.get(columnId as (typeof heatColumns)[number]);
      if (!sample) return null;
      const value = rows.get(rowId)![columnId as (typeof heatColumns)[number]];
      const lowerIsBetter = lowerIsBetterColumns.has(columnId);
      const best = lowerIsBetter ? Math.min(...sample) : Math.max(...sample);
      return { heat: percentileHeat(percentileRank(value, sample, { lowerIsBetter })), tone: value === best ? ("leader" as const) : null };
    };
  }, [rows]);
  return (
    <Section title={copy.percentile} description="리그 안 백분위가 높을수록 붉게, 낮을수록 푸르게 칠해요. 도루자는 적을수록 좋아요.">
      <DataTable columns={hitterColumns} columnGroups={hitterColumnGroups} rows={hitters.map(({ id }) => ({ id }))} labels={labels(copy.percentile)}
        renderCell={(rowId, columnId) => hitterCell(rows.get(rowId)!, columnId)} cellStyle={style} />
    </Section>
  );
}

export function FixedHeaderPreview() {
  const rows = byId(leagueHitters);
  return (
    <Section title={copy.league} description="표 높이를 제한하면 머리글은 고정되고 행만 스크롤돼요.">
      <DataTable columns={hitterColumns} rows={leagueHitters.map(({ id }) => ({ id }))} labels={labels(copy.league)} maxBodyHeight={360}
        renderCell={(rowId, columnId) => hitterCell(rows.get(rowId)!, columnId)} />
    </Section>
  );
}

export function LineScorePreview() {
  return (
    <Section title="라인스코어" description="9회까지 칸을 채우고 연장이면 늘어나요. 진행 중인 회는 강조해요.">
      <Stack gap="lg">
        <LineScore teams={finalGame} totals={lineScoreTotals} accessibilityLabel={copy.lineScore} />
        <LineScore teams={liveGame} totals={lineScoreTotals} currentPeriod={liveGamePeriod} accessibilityLabel={copy.liveScore} />
      </Stack>
    </Section>
  );
}

export function MatrixPreview() {
  return (
    <Section title={copy.matrix} description="행 구단 기준 승-패-무예요. 자기 자신과의 칸은 비워 둬요.">
      <MatrixTable ids={kboTeams} labelOf={(id) => kboTeamNames[id]} getCell={headToHeadCell} highlightId="lg" accessibilityLabel={copy.matrix} />
    </Section>
  );
}

export function ComparisonPreview() {
  return (
    <Section title={copy.comparison} description="더 좋은 쪽을 굵게, 막대를 길게 보여 줘요. 평균자책과 WHIP는 낮을수록 좋아요.">
      <ComparisonTable rows={pitcherComparison} sides={comparisonSides} accessibilityLabel={copy.comparison} />
    </Section>
  );
}
