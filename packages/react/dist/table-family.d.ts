import type { CSSProperties, ReactNode } from "react";
import type { ColorReference } from "@hjmds/design-contracts/color-references";
import { type ComparisonRow, type DataTableCellHeat, type DataTableCellTone, type LineScoreTeam, type MatrixCell } from "@hjmds/design-contracts/components/data-table";
import type { HjmCompositionStyleProp } from "./composition-style.js";
/** Recipe colors resolve through the provider's CSS variables so a theme switch repaints without re-rendering (same as Chart). */
export declare function tableCssColor(reference: ColorReference): string;
export type TableHeatColors = Readonly<{
    high: string;
    low: string;
}>;
/**
 * Cell emphasis as inline style. Heat paints a background *image* so pinned cells keep their opaque
 * canvas color underneath and scrolled content never shows through the translucent tint.
 */
export declare function tableCellEmphasis(decoration: Readonly<{
    tone?: DataTableCellTone | null;
    heat?: DataTableCellHeat | null;
}> | null | undefined, heatColors?: TableHeatColors): Readonly<{
    style: CSSProperties;
    tone?: DataTableCellTone;
    heat?: string;
}>;
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
export declare function LineScore({ teams, totals, currentPeriod, minPeriods, renderTeam, accessibilityLabel, className, layoutStyle }: LineScoreProps): import("react").JSX.Element;
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
export declare function MatrixTable<Key extends string = string>({ ids, labelOf, getCell, highlightId, heatColors, accessibilityLabel, className, layoutStyle }: MatrixTableProps<Key>): import("react").JSX.Element;
export type ComparisonTableProps = Readonly<{
    rows: readonly ComparisonRow[];
    /** Side names and accent colors (team colors). */
    sides: readonly [Readonly<{
        name: string;
        color: string;
    }>, Readonly<{
        name: string;
        color: string;
    }>];
    /** Hide duplicate visual names when the two sides are already identified above; spoken row labels retain them. */
    showSideNames?: boolean;
    accessibilityLabel: string;
    className?: string;
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function ComparisonTable({ rows, sides, showSideNames, accessibilityLabel, className, layoutStyle }: ComparisonTableProps): import("react").JSX.Element;
//# sourceMappingURL=table-family.d.ts.map