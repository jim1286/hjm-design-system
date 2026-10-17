import type { HjmDesignProfile } from "./design-profile.js";
import { layout, spacing } from "./foundations.js";
import type { GridDescriptor } from "./grid.js";
import type { SurfacePadding, SurfaceTone } from "./base-recipes.js";

export type DesignProfileScreenPresentation = HjmDesignProfile["screens"]["overview"];
export function resolveDesignProfileScreen(presentation: DesignProfileScreenPresentation = "dashboard") {
  if (!["dashboard", "editorial", "landscape"].includes(presentation)) throw new TypeError("Unsupported profile screen presentation");
  // Long prose stays in the existing reading width; collections use the existing
  // content width. This does not change the order of accessible screen regions.
  return { maxWidth: presentation === "editorial" ? layout.readingMaxWidth : layout.contentMaxWidth,
    headerAxis: presentation === "dashboard" ? "row" as const : "column" as const,
    centered: presentation === "landscape", gap: presentation === "landscape" ? spacing.xxl : spacing.xl };
}
/**
 * The overview body (tools and collection) is one column: at most the reading width, centered like the header
 * title and the BottomCTA content. Bounding only the tools left the card collection at the full screen width, so at
 * 1024px the cards spanned 48–976 while the field above them sat at 152–872 (2026-10-17 review). The collection
 * now shares the tools' width and start edge instead of using a second container.
 */
export const overviewContentLayout = { maxWidth: layout.readingMaxWidth, alignSelf: "center", width: "100%" } as const;
const collectionGap = { rows: "md", cards: "lg", grid: "lg" } as const;
export function resolveDesignProfileCollection(collection: HjmDesignProfile["compositions"]["collection"] = "rows"): GridDescriptor {
  if (!["rows", "cards", "grid"].includes(collection)) throw new TypeError("Unsupported profile collection");
  // Grid needs three 240-wide columns plus two gaps (760) and the bounded column is 720, so three columns would
  // never resolve. The minimum is derived from that column instead; Grid still reduces columns to the measured
  // container and font scale rather than trusting viewport width alone.
  const minColumnWidth = Math.floor((layout.readingMaxWidth - 2 * spacing[collectionGap.grid]) / 3);
  return { columns: collection === "rows" ? { compact: 1 } : { compact: 1, medium: 2, expanded: collection === "grid" ? 3 : 2 }, gap: { compact: collectionGap[collection] }, minColumnWidth: { compact: minColumnWidth } };
}
export type DesignProfileCollectionItem = Readonly<{
  tone: SurfaceTone; bordered: boolean; padding: SurfacePadding;
  /** Rule drawn above every item but the first, separated from the content by `ruleGap`. */
  ruled: boolean; ruleGap: number;
}>;
/**
 * Rows read as one list divided by rule lines; cards and grid are separate framed surfaces. Rows used to be a stack
 * of small bordered boxes, which made them look like cramped cards and left editorial without its rule lines
 * (2026-10-17 review: presets looked alike). The rule sits halfway in the row gap, so the gap stays the only spacing.
 * Every collection keeps the same Surface host so a profile change never remounts item content; an unframed row
 * Surface is filled with the canvas colour and padded by nothing, so its text starts at the tools' edge.
 */
export function resolveDesignProfileCollectionItem(collection: HjmDesignProfile["compositions"]["collection"] = "rows"): DesignProfileCollectionItem {
  if (!["rows", "cards", "grid"].includes(collection)) throw new TypeError("Unsupported profile collection");
  return collection === "rows"
    ? { tone: "default", bordered: false, padding: "none", ruled: true, ruleGap: spacing[collectionGap.rows] }
    : { tone: "raised", bordered: true, padding: "xl", ruled: false, ruleGap: 0 };
}
