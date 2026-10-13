import type { CSSProperties, ReactNode } from "react";
import type { ColorReference } from "@hjmds/design-contracts/color-references";
import {
  dataTableFamilyRecipe, dataTableRecipe, formatLineScoreCell, resolveComparisonRow, resolveLineScore, resolveMatrix,
  type ComparisonRow, type DataTableCellHeat, type DataTableCellTone, type LineScoreTeam, type MatrixCell,
} from "@hjmds/design-contracts/components/data-table";
import { classNames } from "./internal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

/*
 * Table family companions (2026-10-14): layouts products kept hand-building next to DataTable.
 * LineScore follows MLB/ESPN game headers, MatrixTable a head-to-head cross table, ComparisonTable
 * the ESPN matchup rows. Geometry and rules live in the data-table contract; these only draw.
 */

function kebab(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/** Recipe colors resolve through the provider's CSS variables so a theme switch repaints without re-rendering (same as Chart). */
export function tableCssColor(reference: ColorReference): string {
  const name = reference.source === "theme"
    ? `--hjm-color-${kebab(reference.key)}`
    : reference.source === "accent" ? `--hjm-accent-${kebab(reference.key)}` : `--hjm-accent-fill-${kebab(reference.key)}`;
  return reference.alpha === undefined || reference.alpha === 1
    ? `var(${name})`
    : `color-mix(in srgb, var(${name}) ${Math.round(reference.alpha * 100)}%, transparent)`;
}

/** Live period and "my team" row reuse the shared selected-row tint. */
const familyStyle = { "--hjm-table-family-selected": tableCssColor(dataTableRecipe.row.selectedBackground) } as CSSProperties;
const withFamilyStyle = (layoutStyle: HjmCompositionStyleProp | undefined) => ({ ...familyStyle, ...layoutStyle }) as CSSProperties;

export type TableHeatColors = Readonly<{ high: string; low: string }>;

/**
 * Cell emphasis as inline style. Heat paints a background *image* so pinned cells keep their opaque
 * canvas color underneath and scrolled content never shows through the translucent tint.
 */
export function tableCellEmphasis(
  decoration: Readonly<{ tone?: DataTableCellTone | null; heat?: DataTableCellHeat | null }> | null | undefined,
  heatColors?: TableHeatColors,
): Readonly<{ style: CSSProperties; tone?: DataTableCellTone; heat?: string }> {
  if (!decoration) return { style: {} };
  const style: Record<string, string | number> = {};
  const tone = decoration.tone ?? undefined, heat = decoration.heat ?? null;
  if (tone) {
    style.color = tableCssColor(dataTableFamilyRecipe.tone[tone].color);
    style.fontWeight = dataTableFamilyRecipe.tone[tone].fontWeight;
  }
  if (heat) {
    const base = heatColors?.[heat.side] ?? tableCssColor(dataTableFamilyRecipe.heat[heat.side]);
    style["--hjm-data-table-heat"] = `color-mix(in srgb, ${base} ${Math.round(dataTableFamilyRecipe.heatAlpha[heat.strength] * 100)}%, transparent)`;
  }
  return { style: style as CSSProperties, ...(tone ? { tone } : {}), ...(heat ? { heat: `${heat.side}-${heat.strength}` } : {}) };
}

/* ---------------------------------------------- Line score ------------------------------------- */

export type LineScoreProps = Readonly<{
  teams: readonly LineScoreTeam[];
  /** Total column headers in order, e.g. ["R", "H", "E", "B"]. The first one decides the leader. */
  totals: readonly string[];
  /** Live period (1-based) to highlight. */
  currentPeriod?: number | null;
  minPeriods?: number;
  /** Optional leading content per team (logo/badge). */
  renderTeam?: (team: LineScoreTeam) => ReactNode;
  /** Accessible name of the table (prop name kept for Native parity). */
  accessibilityLabel: string;
  className?: string;
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function LineScore({ teams, totals, currentPeriod = null, minPeriods, renderTeam, accessibilityLabel, className, layoutStyle }: LineScoreProps) {
  const score = resolveLineScore(teams, { totals, currentPeriod, ...(minPeriods !== undefined ? { minPeriods } : {}) });
  const periods = score.columns.filter((column) => column.kind === "period");
  const totalColumns = score.columns.filter((column) => column.kind === "total");
  return (
    <div className={classNames("hjm-table-family", "hjm-line-score", className)} style={withFamilyStyle(layoutStyle)}>
      <table className="hjm-line-score__table" aria-label={accessibilityLabel}>
        <thead>
          <tr>
            <td className="hjm-line-score__team" />
            {periods.map((column, index) => {
              const live = score.currentPeriod === index + 1;
              return <th key={column.id} scope="col" className="hjm-line-score__period" aria-current={live ? "true" : undefined} data-current={live || undefined}>{column.header}</th>;
            })}
            {totalColumns.map((column, index) => (
              <th key={column.id} scope="col" className={classNames("hjm-line-score__total", index === 0 && "hjm-line-score__total-edge")}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id} data-leader={score.leaderId === team.id || undefined}>
              <th scope="row" className="hjm-line-score__team">
                <span className="hjm-line-score__team-content">{renderTeam?.(team)}<span>{team.name}</span></span>
              </th>
              {periods.map((column, index) => {
                const value = team.periods[index];
                return <td key={column.id} className="hjm-line-score__period" data-current={score.currentPeriod === index + 1 || undefined} data-scored={typeof value === "number" && value > 0 || undefined}>{formatLineScoreCell(value)}</td>;
              })}
              {totalColumns.map((column, index) => (
                <td key={column.id} className={classNames("hjm-line-score__total", index === 0 && "hjm-line-score__total-edge")}>{team.totals[column.header] ?? "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------------------------------- Matrix table ----------------------------------- */

export type MatrixTableProps<Key extends string = string> = Readonly<{
  ids: readonly Key[];
  /** Short header per id (team short name). */
  labelOf: (id: Key) => string;
  getCell: (row: Key, column: Key) => MatrixCell | null;
  /** Row id to highlight (my team). */
  highlightId?: Key | null;
  heatColors?: TableHeatColors;
  accessibilityLabel: string;
  className?: string;
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function MatrixTable<Key extends string = string>({ ids, labelOf, getCell, highlightId = null, heatColors, accessibilityLabel, className, layoutStyle }: MatrixTableProps<Key>) {
  const matrix = resolveMatrix(ids, getCell);
  return (
    <div className={classNames("hjm-table-family", "hjm-matrix-table", className)} style={withFamilyStyle(layoutStyle)}>
      <table className="hjm-matrix-table__table" aria-label={accessibilityLabel}>
        <thead>
          <tr>
            <td className="hjm-matrix-table__corner" />
            {ids.map((id) => <th key={id} scope="col">{labelOf(id)}</th>)}
          </tr>
        </thead>
        <tbody>
          {matrix.map((cells, rowIndex) => {
            const rowId = ids[rowIndex]!;
            return (
              <tr key={rowId} data-highlighted={rowId === highlightId || undefined}>
                <th scope="row">{labelOf(rowId)}</th>
                {cells.map((cell, columnIndex) => {
                  // The diagonal is a team against itself: blank and hidden, not "no record".
                  if (cell === "self") return <td key={ids[columnIndex]} className="hjm-matrix-table__self" aria-hidden="true" />;
                  const emphasis = tableCellEmphasis(cell, heatColors);
                  return <td key={ids[columnIndex]} className={emphasis.heat ? "hjm-table-family__heat" : undefined} style={emphasis.style} data-tone={emphasis.tone} data-heat={emphasis.heat}>{cell?.label ?? "—"}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------------------------------- Comparison table ------------------------------- */

export type ComparisonTableProps = Readonly<{
  rows: readonly ComparisonRow[];
  /** Side names and accent colors (team colors). */
  sides: readonly [Readonly<{ name: string; color: string }>, Readonly<{ name: string; color: string }>];
  accessibilityLabel: string;
  className?: string;
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function ComparisonTable({ rows, sides, accessibilityLabel, className, layoutStyle }: ComparisonTableProps) {
  return (
    <section className={classNames("hjm-table-family", "hjm-comparison-table", className)} style={withFamilyStyle(layoutStyle)} aria-label={accessibilityLabel}>
      <div className="hjm-comparison-table__sides" aria-hidden="true">
        {sides.map((side, index) => <span key={index} style={{ color: side.color }}>{side.name}</span>)}
      </div>
      <ul className="hjm-comparison-table__rows" role="list">
        {rows.map((row) => {
          const { winner, shares } = resolveComparisonRow(row);
          const shown = row.display ?? [row.values[0] === null ? "—" : String(row.values[0]), row.values[1] === null ? "—" : String(row.values[1])];
          return (
            <li key={row.id} className="hjm-comparison-table__row" data-winner={winner ?? undefined}>
              {/* One sentence for assistive tech; the visual grid and bars are decoration. */}
              <span className="hjm-visually-hidden">{`${row.label} ${sides[0].name} ${shown[0]}, ${sides[1].name} ${shown[1]}`}</span>
              <div className="hjm-comparison-table__values" aria-hidden="true">
                <span data-win={winner === 0 || undefined}>{shown[0]}</span>
                <span className="hjm-comparison-table__label">{row.label}</span>
                <span data-win={winner === 1 || undefined}>{shown[1]}</span>
              </div>
              <div className="hjm-comparison-table__bars" aria-hidden="true">
                {([0, 1] as const).map((index) => (
                  <span key={index} className="hjm-comparison-table__track" data-side={index}>
                    <span
                      className="hjm-comparison-table__bar"
                      style={{ inlineSize: `${Math.round(shares[index] * 1000) / 10}%`, background: sides[index].color, opacity: winner === null || winner === index ? 1 : 0.35 }}
                    />
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
