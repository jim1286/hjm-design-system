import { spacing, stroke } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
import { focusIndicatorContract } from "./component-contracts.js";
export function resolveAnchorItems(items) {
    if (!Array.isArray(items) || items.length === 0)
        throw new TypeError("Anchor items must not be empty");
    const ids = new Set();
    return items.map((item) => {
        if (!item || typeof item.id !== "string" || !item.id || /\s/u.test(item.id))
            throw new TypeError("Anchor id must be a non-empty HTML id without whitespace");
        if (typeof item.label !== "string" || !item.label.trim())
            throw new TypeError("Anchor label must not be empty");
        if (ids.has(item.id))
            throw new TypeError(`Duplicate Anchor id: ${item.id}`);
        ids.add(item.id);
        return { ...item, href: `#${encodeURIComponent(item.id)}` };
    });
}
/** Positions use one viewport's coordinates. DOM reads and scroll ownership stay in the renderer. */
export function getAnchorCurrentId(positions, offset = 0, atEnd = false) {
    if (!Number.isFinite(offset) || offset < 0)
        throw new RangeError("Anchor offset must be non-negative");
    if (positions.some(({ top }) => !Number.isFinite(top)))
        throw new TypeError("Anchor positions must be finite");
    const ordered = [...positions].sort((a, b) => a.top - b.top);
    if (atEnd)
        return ordered.at(-1)?.id;
    return ordered.filter(({ top }) => top <= offset).at(-1)?.id ?? ordered[0]?.id;
}
export const anchorRecipe = {
    slots: ["root", "list", "link", "indicator"],
    gap: spacing.xxs,
    link: { padding: spacing.xs, color: semanticColors.content.secondary },
    current: { color: semanticColors.content.brand, border: semanticColors.border.focus, width: stroke.strong },
    focus: focusIndicatorContract,
};
export const anchorBehavior = {
    controlled: [], inputs: ["items", "offset", "container", "historyMode"], stateAxes: {},
    web: { roles: ["navigation", "list", "listitem", "link"], keyboard: ["Tab", "Enter"], focus: "native" },
    native: { roles: [], states: [], actions: [] },
    scenarios: ["scroll-position-selects-one-current-location", "activation-focuses-target-and-preserves-offset", "reduced-motion-jumps-instantly", "browser-history-restores-a-section", "missing-targets-are-not-current"],
};
//# sourceMappingURL=anchor.js.map