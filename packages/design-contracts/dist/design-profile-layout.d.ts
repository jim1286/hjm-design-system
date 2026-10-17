import type { HjmDesignProfile } from "./design-profile.js";
import type { GridDescriptor } from "./grid.js";
export type DesignProfileScreenPresentation = HjmDesignProfile["screens"]["overview"];
export declare function resolveDesignProfileScreen(presentation?: DesignProfileScreenPresentation): {
    maxWidth: 720 | 1200;
    headerAxis: "column" | "row";
    centered: boolean;
    gap: 24 | 32;
};
/**
 * Overview tools are form controls: they stop at the reading width while the collection uses the
 * screen width, and the bounded column is centered like the header title and BottomCTA content.
 * Start-aligned tools left one half-width column against centered header/footer (2026-10-17 review).
 */
export declare const overviewToolbarLayout: {
    readonly maxWidth: 720;
    readonly alignSelf: "center";
    readonly width: "100%";
};
export declare function resolveDesignProfileCollection(collection?: HjmDesignProfile["compositions"]["collection"]): GridDescriptor;
//# sourceMappingURL=design-profile-layout.d.ts.map