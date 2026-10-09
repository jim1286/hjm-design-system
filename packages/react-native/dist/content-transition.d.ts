import { type ContentTransitionPreset } from "@hjmds/design-contracts/content-transition";
import { type ReactNode } from "react";
export type ContentTransitionProps = {
    preset?: ContentTransitionPreset;
    travelDirection?: "forward" | "backward";
    stateKey: string;
    children: ReactNode;
    motion?: "system" | "none";
    animateHeight?: boolean;
    enterOnMount?: boolean;
};
export declare function ContentTransition({ stateKey, children, motion: preference, preset: suppliedPreset, travelDirection, animateHeight, enterOnMount }: ContentTransitionProps): import("react").JSX.Element;
export declare function TextTransition({ text, motion: preference, preset }: {
    preset?: ContentTransitionPreset;
    text: string;
    motion?: "system" | "none";
}): import("react").JSX.Element;
//# sourceMappingURL=content-transition.d.ts.map