"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LucideGlyph } from "./internal/lucide-glyph.js";
// Both public tables need the same native button/hidden glyph semantics. Keep
// their two-state/three-state policies and CSS separate rather than merging APIs.
export function TableSortButton({ header, direction, glyphs, className, accessibleName, onSort }) {
    return _jsxs("button", { type: "button", className: className, "aria-label": accessibleName, onClick: onSort, children: [_jsx("span", { children: header }), _jsx(LucideGlyph, { node: direction ? glyphs[direction] : glyphs.none })] });
}
//# sourceMappingURL=table-sort-button.js.map