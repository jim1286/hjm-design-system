import { type ReactNode } from "react";
import { type ScreenLayoutProps } from "./screens.js";
import type { HjmDesignProfile } from "@hjmds/design-contracts/design-profile";
export type OverviewScreenProps = Omit<ScreenLayoutProps, "children"> & Readonly<{
    items: readonly Readonly<{
        id: string;
        children: ReactNode;
    }>[];
    toolbar?: ReactNode;
    toolbarLabel: string;
    collection?: HjmDesignProfile["compositions"]["collection"];
    toolbarPresentation?: HjmDesignProfile["compositions"]["toolbar"];
}>;
/** Optional collection screen; ScreenLayout still owns loading/error/scrolling.
 * Unlike settings/inbox it owns a profile-selected collection and persistent tools.
 * It never owns product mutations or chooses a different component for each theme. */
export declare function OverviewScreen({ items, toolbar, toolbarLabel, collection: suppliedCollection, toolbarPresentation: suppliedToolbarPresentation, ...screen }: OverviewScreenProps): import("react").JSX.Element;
//# sourceMappingURL=design-profile.d.ts.map