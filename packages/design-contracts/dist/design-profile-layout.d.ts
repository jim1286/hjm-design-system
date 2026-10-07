import type { HjmDesignProfile } from "./design-profile.js";
import type { GridDescriptor } from "./grid.js";
export type DesignProfileScreenPresentation = HjmDesignProfile["screens"]["overview"];
export declare function resolveDesignProfileScreen(presentation?: DesignProfileScreenPresentation): {
    maxWidth: 720 | 1200;
    headerAxis: "column" | "row";
    centered: boolean;
    gap: 24 | 32;
};
export declare function resolveDesignProfileCollection(collection?: HjmDesignProfile["compositions"]["collection"]): GridDescriptor;
//# sourceMappingURL=design-profile-layout.d.ts.map