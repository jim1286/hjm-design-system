import { type ReactNode, type RefObject } from "react";
export type ContentTransitionProps = {
    stateKey: string;
    children: ReactNode;
    motion?: "system" | "none";
    /** Host chooses a meaningful focus destination, e.g. the new panel heading. */
    focusTarget?: RefObject<HTMLElement | null>;
};
/** Motion Primitives' keyed transition pattern, adapted to HJM's single active subtree.
 * No exiting interactive copy: it would duplicate fields and focus targets. See THIRD_PARTY_NOTICES. */
export declare function ContentTransition({ stateKey, children, motion: preference, focusTarget }: ContentTransitionProps): import("react").JSX.Element;
export type TextTransitionProps = {
    text: string;
    motion?: "system" | "none";
};
/** Whole-text fade preserves graphemes, text wrapping, selection and a single spoken value. */
export declare function TextTransition({ text, motion: preference }: TextTransitionProps): import("react").JSX.Element;
//# sourceMappingURL=content-transition.d.ts.map