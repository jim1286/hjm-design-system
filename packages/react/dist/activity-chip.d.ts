import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { type ActivityChipEmphasis } from "@hjmds/design-contracts/activity-chip";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type { ActivityChipEmphasis } from "@hjmds/design-contracts/activity-chip";
export type ActivityChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type" | "style" | "aria-expanded" | "aria-label"> & Readonly<{
    /** Short visible status, for example "Polishing". */
    label: string;
    /** Full spoken status; defaults to `label`. */
    accessibilityLabel?: string;
    /** `emphasis` marks a result waiting for the user. */
    emphasis?: ActivityChipEmphasis;
    /** Whether the panel this chip toggles is open (`aria-expanded`). */
    expanded?: boolean;
    /** Decorative leading visual (mascot, avatar); hidden from assistive technology. */
    media?: ReactNode;
    /** Canonical layout-only placement on the root button. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const ActivityChip: import("react").ForwardRefExoticComponent<Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "style" | "aria-expanded" | "aria-label" | "type"> & Readonly<{
    /** Short visible status, for example "Polishing". */
    label: string;
    /** Full spoken status; defaults to `label`. */
    accessibilityLabel?: string;
    /** `emphasis` marks a result waiting for the user. */
    emphasis?: ActivityChipEmphasis;
    /** Whether the panel this chip toggles is open (`aria-expanded`). */
    expanded?: boolean;
    /** Decorative leading visual (mascot, avatar); hidden from assistive technology. */
    media?: ReactNode;
    /** Canonical layout-only placement on the root button. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=activity-chip.d.ts.map