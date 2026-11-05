"use client";

import type { ReactNode } from "react";
import type { DataTableSortDirection } from "@hjmds/design-contracts/components/data-table";
import type { IconNode } from "lucide";
import { LucideGlyph } from "./internal/lucide-glyph.js";

// Both public tables need the same native button/hidden glyph semantics. Keep
// their two-state/three-state policies and CSS separate rather than merging APIs.
export function TableSortButton({ header, direction, glyphs, className, accessibleName, onSort }: Readonly<{
  header: ReactNode; direction?: DataTableSortDirection | null;
  glyphs: Readonly<{ ascending: IconNode; descending: IconNode; none: IconNode }>;
  className: string; accessibleName?: string; onSort: () => void;
}>) {
  return <button type="button" className={className} aria-label={accessibleName} onClick={onSort}>
    <span>{header}</span>
    <LucideGlyph node={direction ? glyphs[direction] : glyphs.none} />
  </button>;
}
