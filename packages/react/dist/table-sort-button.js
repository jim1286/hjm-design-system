import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Both public tables need the same native button/hidden glyph semantics. Keep
// their two-state/three-state policies and CSS separate rather than merging APIs.
export function TableSortButton({ header, direction, glyphs, className, accessibleName, onSort }) {
    return _jsxs("button", { type: "button", className: className, "aria-label": accessibleName, onClick: onSort, children: [_jsx("span", { children: header }), _jsx("span", { "aria-hidden": "true", children: direction ? glyphs[direction] : glyphs.none })] });
}
//# sourceMappingURL=table-sort-button.js.map