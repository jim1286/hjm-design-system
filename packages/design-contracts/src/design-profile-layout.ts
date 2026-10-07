import type { HjmDesignProfile } from "./design-profile.js";
import { layout, spacing } from "./foundations.js";
import type { GridDescriptor } from "./grid.js";

export type DesignProfileScreenPresentation = HjmDesignProfile["screens"]["overview"];
export function resolveDesignProfileScreen(presentation: DesignProfileScreenPresentation = "dashboard") {
  if (!["dashboard", "editorial", "landscape"].includes(presentation)) throw new TypeError("Unsupported profile screen presentation");
  // Long prose stays in the existing reading width; collections use the existing
  // content width. This does not change the order of accessible screen regions.
  return { maxWidth: presentation === "editorial" ? layout.readingMaxWidth : layout.contentMaxWidth,
    headerAxis: presentation === "dashboard" ? "row" as const : "column" as const,
    centered: presentation === "landscape", gap: presentation === "landscape" ? spacing.xxl : spacing.xl };
}
export function resolveDesignProfileCollection(collection: HjmDesignProfile["compositions"]["collection"] = "rows"): GridDescriptor {
  if (!["rows", "cards", "grid"].includes(collection)) throw new TypeError("Unsupported profile collection");
  // Three-column editorial cards stay readable at 240; Grid reduces columns to
  // the measured container and font scale instead of trusting viewport width alone.
  return { columns: collection === "rows" ? { compact: 1 } : { compact: 1, medium: 2, expanded: collection === "grid" ? 3 : 2 }, gap: { compact: collection === "rows" ? "sm" : "lg" }, minColumnWidth: { compact: 240 } };
}
