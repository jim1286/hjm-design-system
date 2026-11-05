/**
 * Shared semantic names. Renderers map these roles to their tree-shakeable SVG
 * or native glyph component instead of leaking a third-party icon name into a
 * product screen.
 */
export const semanticIconNames = [
    "add",
    "ai",
    "alert",
    "arrowDown",
    "arrowUp",
    "back",
    "calendar",
    "check",
    "chevronDown",
    "chevronEnd",
    "chevronStart",
    "chevronUp",
    "close",
    "compare",
    "copy",
    "delete",
    "download",
    "edit",
    "error",
    "favorite",
    "filter",
    "forward",
    "help",
    "home",
    "info",
    "lock",
    "menu",
    "more",
    "moreVertical",
    "notifications",
    "pause",
    "play",
    "refresh",
    "rotate",
    "search",
    "settings",
    "share",
    "success",
    "trendDown",
    "trendFlat",
    "trendUp",
    "unblock",
    "upload",
    "user",
    "users",
    "visibility",
    "visibilityOff",
    "warning",
];
/**
 * Lucide icon (kebab-case name, lucide 1.49.0) that draws each semantic mark. HJM no longer draws its own artwork:
 * 2026-11-05 the user made Lucide the only icon source, after hand-drawn marks shipped with detached arrowheads and
 * drifted from the Lucide glyphs products already placed beside them. Both renderers import exactly these icons from
 * `lucide` by name (static imports keep the rest of the library out of bundles), and their tests hold them to this map.
 * A meaning Lucide does not cover is mapped to its nearest Lucide icon (`trendFlat` → `equal`); adding a new
 * hand-drawn mark needs the user's explicit approval.
 */
export const semanticIconLucideNames = {
    add: "plus",
    ai: "sparkles",
    alert: "triangle-alert",
    arrowDown: "arrow-down",
    arrowUp: "arrow-up",
    back: "arrow-left",
    calendar: "calendar",
    check: "check",
    chevronDown: "chevron-down",
    chevronEnd: "chevron-right",
    chevronStart: "chevron-left",
    chevronUp: "chevron-up",
    close: "x",
    compare: "arrow-left-right",
    copy: "copy",
    delete: "trash",
    download: "download",
    edit: "pencil",
    error: "circle-alert",
    favorite: "heart",
    filter: "funnel",
    forward: "arrow-right",
    help: "circle-question-mark",
    home: "house",
    info: "info",
    lock: "lock",
    menu: "menu",
    more: "ellipsis",
    moreVertical: "ellipsis-vertical",
    notifications: "bell",
    pause: "pause",
    play: "play",
    refresh: "refresh-cw",
    rotate: "rotate-cw",
    search: "search",
    settings: "settings",
    share: "share-2",
    success: "circle-check",
    trendDown: "trending-down",
    trendFlat: "equal",
    trendUp: "trending-up",
    unblock: "lock-open",
    upload: "upload",
    user: "user",
    users: "users",
    visibility: "eye",
    visibilityOff: "eye-off",
    warning: "triangle-alert",
};
const semanticIconNameSet = new Set(semanticIconNames);
/** Narrows a product glyph name to the shared set, so adapters can draw HJM's Lucide marks and fall back to their own. */
export function isSemanticIconName(name) {
    return semanticIconNameSet.has(name);
}
const logicalIconNames = new Set([
    "back",
    "chevronEnd",
    "chevronStart",
    "forward",
]);
export function getIconDirectionality(name) {
    return logicalIconNames.has(name) ? "mirror-in-rtl" : "fixed";
}
export function getIconTransform(directionality, direction) {
    if (directionality !== "fixed" && directionality !== "mirror-in-rtl") {
        throw new TypeError(`Unsupported Icon directionality: ${String(directionality)}`);
    }
    if (direction !== "ltr" && direction !== "rtl") {
        throw new TypeError(`Unsupported Icon direction: ${String(direction)}`);
    }
    return directionality === "mirror-in-rtl" && direction === "rtl"
        ? "mirror-inline"
        : "none";
}
const sizes = new Set(["xs", "sm", "md", "lg", "xl", "xxl", "xxxl"]);
const tones = new Set([
    "primary",
    "secondary",
    "decorative",
    "brand",
    "info",
    "success",
    "warning",
    "danger",
    "inverse",
]);
const weights = new Set(["regular", "strong"]);
export function validateIconDescriptor(descriptor) {
    const runtimeName = descriptor.name;
    const runtimeTone = descriptor.tone;
    const runtimeDecorative = descriptor.decorative;
    const runtimeLabel = descriptor.accessibilityLabel;
    if (typeof runtimeName !== "string" || runtimeName.trim().length === 0) {
        throw new TypeError("Icon name must not be empty");
    }
    if (runtimeName !== runtimeName.trim()) {
        throw new TypeError("Icon name must not start or end with whitespace");
    }
    if (descriptor.size !== undefined && !sizes.has(descriptor.size)) {
        throw new TypeError(`Unsupported Icon size: ${String(descriptor.size)}`);
    }
    if (runtimeTone !== undefined && !tones.has(runtimeTone)) {
        throw new TypeError(`Unsupported Icon tone: ${String(runtimeTone)}`);
    }
    if (descriptor.weight !== undefined && !weights.has(descriptor.weight)) {
        throw new TypeError(`Unsupported Icon weight: ${String(descriptor.weight)}`);
    }
    if (descriptor.directionality !== undefined &&
        descriptor.directionality !== "fixed" &&
        descriptor.directionality !== "mirror-in-rtl") {
        throw new TypeError(`Unsupported Icon directionality: ${String(descriptor.directionality)}`);
    }
    if (runtimeDecorative !== undefined &&
        runtimeDecorative !== true &&
        runtimeDecorative !== false) {
        throw new TypeError("Icon decorative must be a boolean when provided");
    }
    if (runtimeDecorative === false) {
        if (typeof runtimeLabel !== "string" || runtimeLabel.trim().length === 0) {
            throw new TypeError("Informative Icon accessibilityLabel must not be empty");
        }
        if (runtimeTone === "decorative") {
            throw new TypeError("Informative Icon cannot use the decorative tone");
        }
    }
    else if (runtimeLabel !== undefined) {
        throw new TypeError("Decorative Icon must not provide accessibilityLabel");
    }
}
export function resolveIconDescriptor(descriptor) {
    validateIconDescriptor(descriptor);
    const common = {
        name: descriptor.name,
        size: descriptor.size ?? "md",
        tone: descriptor.tone ?? "secondary",
        weight: descriptor.weight ?? "regular",
        directionality: descriptor.directionality ?? getIconDirectionality(descriptor.name),
    };
    if (descriptor.decorative === false) {
        return {
            ...common,
            decorative: false,
            accessibilityLabel: descriptor.accessibilityLabel,
        };
    }
    return {
        ...common,
        decorative: true,
    };
}
//# sourceMappingURL=icon.js.map