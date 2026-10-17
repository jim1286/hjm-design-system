import type { HjmDesignProfile } from "./design-profile.js";
import type { GridDescriptor } from "./grid.js";
import type { SurfacePadding, SurfaceTone } from "./base-recipes.js";
export type DesignProfileScreenPresentation = HjmDesignProfile["screens"]["overview"];
export declare function resolveDesignProfileScreen(presentation?: DesignProfileScreenPresentation): {
    maxWidth: 720 | 1200;
    headerAxis: "column" | "row";
    centered: boolean;
    gap: 24 | 32;
};
/**
 * The overview body (tools and collection) is one column: at most the reading width, centered like the header
 * title and the BottomCTA content. Bounding only the tools left the card collection at the full screen width, so at
 * 1024px the cards spanned 48–976 while the field above them sat at 152–872 (2026-10-17 review). The collection
 * now shares the tools' width and start edge instead of using a second container.
 */
export declare const overviewContentLayout: {
    readonly maxWidth: 720;
    readonly alignSelf: "center";
    readonly width: "100%";
};
export declare function resolveDesignProfileCollection(collection?: HjmDesignProfile["compositions"]["collection"]): GridDescriptor;
export type DesignProfileCollectionItem = Readonly<{
    tone: SurfaceTone;
    bordered: boolean;
    padding: SurfacePadding;
    /** Rule drawn above every item but the first, separated from the content by `ruleGap`. */
    ruled: boolean;
    ruleGap: number;
}>;
/**
 * Rows read as one list divided by rule lines; cards and grid are separate framed surfaces. Rows used to be a stack
 * of small bordered boxes, which made them look like cramped cards and left editorial without its rule lines
 * (2026-10-17 review: presets looked alike). The rule sits halfway in the row gap, so the gap stays the only spacing.
 * Every collection keeps the same Surface host so a profile change never remounts item content; an unframed row
 * Surface is filled with the canvas colour and padded by nothing, so its text starts at the tools' edge.
 */
export declare function resolveDesignProfileCollectionItem(collection?: HjmDesignProfile["compositions"]["collection"]): DesignProfileCollectionItem;
//# sourceMappingURL=design-profile-layout.d.ts.map