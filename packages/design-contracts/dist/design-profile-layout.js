import { layout, spacing } from "./foundations.js";
export function resolveDesignProfileScreen(presentation = "dashboard") {
    if (!["dashboard", "editorial", "landscape"].includes(presentation))
        throw new TypeError("Unsupported profile screen presentation");
    // Long prose stays in the existing reading width; collections use the existing
    // content width. This does not change the order of accessible screen regions.
    return { maxWidth: presentation === "editorial" ? layout.readingMaxWidth : layout.contentMaxWidth,
        headerAxis: presentation === "dashboard" ? "row" : "column",
        centered: presentation === "landscape", gap: presentation === "landscape" ? spacing.xxl : spacing.xl };
}
export function resolveDesignProfileCollection(collection = "rows") {
    if (!["rows", "cards", "grid"].includes(collection))
        throw new TypeError("Unsupported profile collection");
    // Three-column editorial cards stay readable at 240; Grid reduces columns to
    // the measured container and font scale instead of trusting viewport width alone.
    return { columns: collection === "rows" ? { compact: 1 } : { compact: 1, medium: 2, expanded: collection === "grid" ? 3 : 2 }, gap: { compact: collection === "rows" ? "sm" : "lg" }, minColumnWidth: { compact: 240 } };
}
//# sourceMappingURL=design-profile-layout.js.map