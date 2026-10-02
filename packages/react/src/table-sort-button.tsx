import type { ReactNode } from "react";
import type { DataTableSortDirection } from "@hjmds/design-contracts/components/data-table";

// Both public tables need the same native button/hidden glyph semantics. Keep
// their two-state/three-state policies and CSS separate rather than merging APIs.
export function TableSortButton({ header, direction, glyphs, className, accessibleName, onSort }: Readonly<{
  header: ReactNode; direction?: DataTableSortDirection | null;
  glyphs: Readonly<{ ascending: string; descending: string; none: string }>;
  className: string; accessibleName?: string; onSort: () => void;
}>) {
  return <button type="button" className={className} aria-label={accessibleName} onClick={onSort}>
    <span>{header}</span>
    <span aria-hidden="true">{direction ? glyphs[direction] : glyphs.none}</span>
  </button>;
}
