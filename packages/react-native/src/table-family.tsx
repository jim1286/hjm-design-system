import type { ComponentRef } from "react";
import { useRef, useState, type ReactNode } from "react";
import { ScrollView, Text as NativeText, View } from "react-native";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import {
  dataTableFamilyRecipe, dataTableRecipe, formatLineScoreCell, resolveComparisonRow, resolveLineScore, resolveMatrix,
  type ComparisonRow, type LineScoreTeam, type MatrixCell,
} from "@hjmds/design-contracts/components/data-table";
import { fontWeight, spacing } from "@hjmds/design-contracts/foundations";
import { textRecipe } from "@hjmds/design-contracts/recipes";
import { useHjmNativeTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

/*
 * Table family companions (2026-10-14): layouts products kept hand-building next to DataTable.
 * LineScore follows MLB/ESPN game headers, MatrixTable a head-to-head cross table, ComparisonTable
 * the ESPN matchup rows. Geometry and rules live in the data-table contract; these only draw.
 */

function usePalette() {
  const theme = useHjmNativeTheme();
  return { colors: theme.colors, color: (reference: Parameters<typeof resolveColorReference>[0]) => resolveColorReference(reference, theme.palette) };
}
const num = { fontVariant: ["tabular-nums" as const] };

export type LineScoreProps = Readonly<{
  teams: readonly LineScoreTeam[];
  /** Total column headers in order, e.g. ["R", "H", "E", "B"]. The first one decides the leader. */
  totals: readonly string[];
  /** Live period (1-based) to highlight. */
  currentPeriod?: number | null;
  minPeriods?: number;
  /** Optional leading cell per team (logo/badge). */
  renderTeam?: (team: LineScoreTeam) => ReactNode;
  accessibilityLabel: string;
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function LineScore({ teams, totals, currentPeriod = null, minPeriods, renderTeam, accessibilityLabel, layoutStyle }: LineScoreProps) {
  const { colors, color } = usePalette();
  const score = resolveLineScore(teams, { totals, currentPeriod, ...(minPeriods !== undefined ? { minPeriods } : {}) });
  const periods = score.columns.filter(column => column.kind === "period"), totalColumns = score.columns.filter(column => column.kind === "total");
  // Nine innings plus R/H/E/B fit a 360pt phone without scrolling; a team mark (renderTeam) replaces the
  // visible name, which stays in the row's accessibility label (2026-10-14 Yajalal device check: "L…").
  const CELL = 23, TOTAL = 27, ROW = 36, NAME = renderTeam ? 40 : 64;
  const header = color(dataTableRecipe.header.color), live = color(dataTableFamilyRecipe.currentPeriod.color);
  // Extra innings overflow the period strip. Open it at the live period (or the latest one) and flash the scroll
  // indicator; starting at inning 1 hid the 9th–11th and read as an eight-inning game (2026-10-17 review N4).
  const strip = useRef<ComponentRef<typeof ScrollView>>(null), viewport = useRef(0);
  const focusIndex = score.currentPeriod ?? periods.length;
  const revealPeriod = (contentWidth: number) => {
    const overflow = contentWidth - viewport.current;
    if (viewport.current <= 0 || overflow <= 0) return;
    strip.current?.scrollTo({ x: Math.min(overflow, Math.max(0, focusIndex * CELL - viewport.current)), animated: false });
    strip.current?.flashScrollIndicators();
  };
  const rowLabel = (team: LineScoreTeam) => `${team.name} ${totalColumns.map(column => `${column.header} ${team.totals[column.header] ?? "—"}`).join(", ")}`;
  return <View accessibilityLabel={accessibilityLabel} style={[{ flexDirection: "row", borderRadius: 12, overflow: "hidden", backgroundColor: colors.surface, paddingVertical: spacing.xs }, layoutStyle]}>
    <View>
      <View style={{ height: 26 }} />
      {teams.map(team => <View key={team.id} accessible accessibilityLabel={rowLabel(team)} style={{ height: ROW, width: NAME, flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: spacing.sm }}>
        {renderTeam ? renderTeam(team) : <NativeText numberOfLines={1} style={{ flex: 1, color: score.leaderId === team.id ? colors.text : colors.textBody, fontSize: 14, fontWeight: score.leaderId === team.id ? fontWeight.semibold : textRecipe.emphasis.medium }}>{team.name}</NativeText>}
      </View>)}
    </View>
    <ScrollView ref={strip} horizontal style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
      onLayout={event => { viewport.current = event.nativeEvent.layout.width; }} onContentSizeChange={revealPeriod}>
      {periods.map((column, index) => {
        const isLive = score.currentPeriod === index + 1;
        return <View key={column.id} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ width: CELL, alignItems: "center", borderRadius: 8, backgroundColor: isLive ? color(dataTableFamilyRecipe.currentPeriod.background) : "transparent" }}>
          <NativeText style={{ height: 26, lineHeight: 26, color: isLive ? live : header, fontSize: 11, fontWeight: textRecipe.emphasis.medium }}>{column.header}</NativeText>
          {teams.map(team => <NativeText key={team.id} style={{ height: ROW, lineHeight: ROW, color: team.periods[index] ? colors.text : colors.textMuted, fontSize: 14, fontWeight: team.periods[index] ? textRecipe.emphasis.medium : textRecipe.emphasis.regular, ...num }}>{formatLineScoreCell(team.periods[index])}</NativeText>)}
        </View>;
      })}
    </ScrollView>
    <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ flexDirection: "row", borderLeftWidth: 1, borderColor: color(dataTableRecipe.row.borderBottom), paddingHorizontal: 4 }}>
      {totalColumns.map((column, index) => <View key={column.id} style={{ width: TOTAL, alignItems: "center" }}>
        <NativeText style={{ height: 26, lineHeight: 26, color: header, fontSize: 11, fontWeight: textRecipe.emphasis.medium }}>{column.header}</NativeText>
        {teams.map(team => <NativeText key={team.id} style={{ height: ROW, lineHeight: ROW, color: index === 0 ? colors.text : colors.textBody, fontSize: index === 0 ? 16 : 14, fontWeight: index === 0 ? fontWeight.semibold : textRecipe.emphasis.medium, ...num }}>{team.totals[column.header] ?? "—"}</NativeText>)}
      </View>)}
    </View>
  </View>;
}

export type MatrixTableProps<Key extends string = string> = Readonly<{
  ids: readonly Key[];
  /** Short header per id (team short name). */
  labelOf: (id: Key) => string;
  getCell: (row: Key, column: Key) => MatrixCell | null;
  /** Row id to highlight (my team). */
  highlightId?: Key | null;
  heatColors?: Readonly<{ high: string; low: string }>;
  accessibilityLabel: string;
  /**
   * Localized name of one cell for screen readers. Native has no table semantics to announce the row and
   * column headers (Web reads them from <th>), so the default joins them language-neutrally: "row, column: value".
   */
  cellAccessibilityLabel?: (row: Key, column: Key, value: string) => string;
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function MatrixTable<Key extends string = string>({ ids, labelOf, getCell, highlightId = null, heatColors, accessibilityLabel, cellAccessibilityLabel, layoutStyle }: MatrixTableProps<Key>) {
  const { colors, color } = usePalette();
  const matrix = resolveMatrix(ids, getCell);
  const heat = { high: heatColors?.high ?? color(dataTableFamilyRecipe.heat.high), low: heatColors?.low ?? color(dataTableFamilyRecipe.heat.low) };
  const CELL = 58, NAME = 52, ROW = 38;
  const border = color(dataTableRecipe.row.borderBottom);
  return <View accessibilityLabel={accessibilityLabel} style={[{ flexDirection: "row", borderRadius: 12, overflow: "hidden", backgroundColor: colors.surface }, layoutStyle]}>
    <View style={{ borderRightWidth: 1, borderColor: border }}>
      <View style={{ height: 32 }} />
      {ids.map(id => <View key={id} style={{ width: NAME, height: ROW, justifyContent: "center", paddingHorizontal: spacing.sm, borderTopWidth: 1, borderColor: border, backgroundColor: id === highlightId ? color(dataTableFamilyRecipe.highlight.background) : "transparent" }}>
        <NativeText numberOfLines={1} style={{ color: colors.text, fontSize: 13, fontWeight: textRecipe.emphasis.medium }}>{labelOf(id)}</NativeText>
      </View>)}
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={{ flexDirection: "row", height: 32 }}>{ids.map(id => <NativeText key={id} accessibilityRole="header" numberOfLines={1} style={{ width: CELL, lineHeight: 32, textAlign: "center", color: color(dataTableRecipe.header.color), fontSize: 12, fontWeight: textRecipe.emphasis.medium }}>{labelOf(id)}</NativeText>)}</View>
        {matrix.map((cells, rowIndex) => <View key={ids[rowIndex]} style={{ flexDirection: "row", height: ROW, borderTopWidth: 1, borderColor: border, backgroundColor: ids[rowIndex] === highlightId ? color(dataTableFamilyRecipe.highlight.background) : "transparent" }}>
          {cells.map((cell, columnIndex) => {
            if (cell === "self") return <View key={columnIndex} accessibilityElementsHidden importantForAccessibility="no" style={{ width: CELL, backgroundColor: color(dataTableFamilyRecipe.groupRow.background) }} />;
            const tone = cell?.tone ? dataTableFamilyRecipe.tone[cell.tone] : null;
            return <View key={columnIndex} accessible accessibilityLabel={cellAccessibilityLabel ? cellAccessibilityLabel(ids[rowIndex]!, ids[columnIndex]!, cell?.label ?? "—") : `${labelOf(ids[rowIndex]!)}, ${labelOf(ids[columnIndex]!)}: ${cell?.label ?? "—"}`} style={{ width: CELL, alignItems: "center", justifyContent: "center" }}>
              {/* Heat fills the whole cell, as Web's cell background; an inset pill made the same table look different (2026-10-17 N5). */}
              {cell?.heat && <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: heat[cell.heat.side], opacity: dataTableFamilyRecipe.heatAlpha[cell.heat.strength] }} />}
              <NativeText numberOfLines={1} style={{ color: tone ? color(tone.color) : colors.textBody, fontSize: 12, fontWeight: tone ? tone.fontWeight : textRecipe.emphasis.medium, ...num }}>{cell?.label ?? "—"}</NativeText>
            </View>;
          })}
        </View>)}
      </View>
    </ScrollView>
  </View>;
}

export type ComparisonTableProps = Readonly<{
  rows: readonly ComparisonRow[];
  /** Side names and accent colors (team colors). */
  sides: readonly [Readonly<{ name: string; color: string }>, Readonly<{ name: string; color: string }>];
  /** Hide duplicate visual names when the two sides are already identified above; spoken row labels retain them. */
  showSideNames?: boolean;
  accessibilityLabel: string;
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function ComparisonTable({ rows, sides, showSideNames = true, accessibilityLabel, layoutStyle }: ComparisonTableProps) {
  const { colors, color } = usePalette();
  const [width, setWidth] = useState(0);
  return <View accessibilityLabel={accessibilityLabel} onLayout={event => setWidth(event.nativeEvent.layout.width)} style={[{ borderRadius: 12, backgroundColor: colors.surface, paddingVertical: spacing.xs }, layoutStyle]}>
    {showSideNames && <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
      {sides.map((side, index) => <NativeText key={index} numberOfLines={1} style={{ color: side.color, fontSize: 13, fontWeight: textRecipe.emphasis.medium }}>{side.name}</NativeText>)}
    </View>}
    {rows.map((row, rowIndex) => {
      const { winner, shares } = resolveComparisonRow(row);
      const shown = row.display ?? [row.values[0] === null ? "—" : String(row.values[0]), row.values[1] === null ? "—" : String(row.values[1])];
      const half = Math.max(0, width / 2 - spacing.md - spacing.sm / 2);
      return <View key={row.id} accessible accessibilityLabel={`${row.label} ${sides[0].name} ${shown[0]}, ${sides[1].name} ${shown[1]}`} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderTopWidth: rowIndex === 0 && !showSideNames ? 0 : 1, borderColor: color(dataTableRecipe.row.borderBottom), gap: spacing.xs }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <NativeText style={{ flex: 1, color: winner === 0 ? colors.text : colors.textSub, fontSize: 16, fontWeight: winner === 0 ? textRecipe.emphasis.medium : textRecipe.emphasis.regular, ...num }}>{shown[0]}</NativeText>
          <NativeText style={{ color: colors.text, fontSize: 13, fontWeight: textRecipe.emphasis.medium }}>{row.label}</NativeText>
          <NativeText style={{ flex: 1, textAlign: "right", color: winner === 1 ? colors.text : colors.textSub, fontSize: 16, fontWeight: winner === 1 ? textRecipe.emphasis.medium : textRecipe.emphasis.regular, ...num }}>{shown[1]}</NativeText>
        </View>
        <View style={{ flexDirection: "row", gap: spacing.sm, height: 5 }}>
          {[0, 1].map(index => <View key={index} style={{ flex: 1, flexDirection: index === 0 ? "row-reverse" : "row", backgroundColor: colors.surfaceAlt, borderRadius: 2 }}>
            <View style={{ width: half * shares[index as 0 | 1], borderRadius: 2, backgroundColor: sides[index as 0 | 1].color, opacity: winner === null || winner === index ? 1 : 0.6 }} />
          </View>)}
        </View>
      </View>;
    })}
  </View>;
}
