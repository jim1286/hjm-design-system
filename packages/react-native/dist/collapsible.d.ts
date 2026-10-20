import { type CollapsibleOpenState } from "@hjmds/design-contracts/components/collapsible";
import { type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type CollapsibleProps = CollapsibleOpenState & Readonly<{
    /** The control's label; it also tells the user what will appear. */
    trigger: ReactNode;
    /** Accessible action name when the trigger is artwork or has a shorter visible label. */
    triggerLabel?: string;
    /** Static heading beside the disclosure action, outside the button's accessible name. */
    title?: ReactNode;
    /** While content is being prepared, replace the action with one labeled spinner. */
    pendingLabel?: string;
    children: ReactNode;
    disabled?: boolean;
    /** Inline tools stay expanded without a disclosure trigger. */
    presentation?: "disclosure" | "inline";
    /** Preserve local input state while hidden; hidden content stays inaccessible. */
    keepMounted?: boolean;
    /**
     * `none` leaves the open/closed mark to the trigger, which then places `CollapsibleMarker` itself — for triggers
     * whose label is not a single row, where the end-aligned mark floated alone (FolderPreview, 2026-10-17 review).
     */
    marker?: "end" | "none";
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Collapsible({ trigger, triggerLabel, title, pendingLabel, children, disabled, presentation, keepMounted, marker, layoutStyle, ...openState }: CollapsibleProps): import("react").JSX.Element;
/** Decoration only: the expanded state travels through the trigger's accessibilityState. */
export declare function CollapsibleMarker({ open }: Readonly<{
    open: boolean;
}>): import("react").JSX.Element;
//# sourceMappingURL=collapsible.d.ts.map