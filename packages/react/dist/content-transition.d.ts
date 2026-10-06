import { type ContentTransitionPreset } from "@hjmds/design-contracts/content-transition";
import { type ReactNode, type RefObject } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type ContentTransitionProps = {
    preset?: ContentTransitionPreset;
    stateKey: string;
    children: ReactNode;
    motion?: "system" | "none";
    /** Host chooses a meaningful focus destination, e.g. the new panel heading. */
    focusTarget?: RefObject<HTMLElement | null>;
    /** Canonical layout-only placement on the stable outer wrapper, not the keyed panel. */
    layoutStyle?: HjmCompositionStyleProp;
};
/** Motion Primitives' keyed transition pattern, adapted to HJM's single active subtree.
 * No exiting interactive copy: it would duplicate fields and focus targets. See THIRD_PARTY_NOTICES. */
export declare function ContentTransition({ stateKey, children, motion: preference, preset, focusTarget, layoutStyle }: ContentTransitionProps): import("react").JSX.Element;
export type TextTransitionProps = {
    preset?: ContentTransitionPreset;
    text: string;
    motion?: "system" | "none";
    layoutStyle?: HjmCompositionStyleProp;
};
/** Whole-text fade preserves graphemes, text wrapping, selection and a single spoken value. */
export declare function TextTransition({ text, motion: preference, preset, layoutStyle }: TextTransitionProps): import("react").JSX.Element;
//# sourceMappingURL=content-transition.d.ts.map