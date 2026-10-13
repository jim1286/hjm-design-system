import { type ReactNode } from "react";
import { type ComparisonRow, type LineScoreTeam, type MatrixCell } from "@hjmds/design-contracts/components/data-table";
import type { HjmCompositionStyleProp } from "./composition-style.js";
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
export declare function LineScore({ teams, totals, currentPeriod, minPeriods, renderTeam, accessibilityLabel, layoutStyle }: LineScoreProps): import("react").JSX.Element;
export type MatrixTableProps<Key extends string = string> = Readonly<{
    ids: readonly Key[];
    /** Short header per id (team short name). */
    labelOf: (id: Key) => string;
    getCell: (row: Key, column: Key) => MatrixCell | null;
    /** Row id to highlight (my team). */
    highlightId?: Key | null;
    heatColors?: Readonly<{
        high: string;
        low: string;
    }>;
    accessibilityLabel: string;
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function MatrixTable<Key extends string = string>({ ids, labelOf, getCell, highlightId, heatColors, accessibilityLabel, layoutStyle }: MatrixTableProps<Key>): import("react").JSX.Element;
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
    accessibilityLabel: string;
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function ComparisonTable({ rows, sides, accessibilityLabel, layoutStyle }: ComparisonTableProps): import("react").JSX.Element;
//# sourceMappingURL=table-family.d.ts.map