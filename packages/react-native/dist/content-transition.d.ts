import { type ReactNode } from "react";
export type ContentTransitionProps = {
    stateKey: string;
    children: ReactNode;
    motion?: "system" | "none";
};
export declare function ContentTransition({ stateKey, children, motion: preference }: ContentTransitionProps): import("react").JSX.Element;
export declare function TextTransition({ text, motion: preference }: {
    text: string;
    motion?: "system" | "none";
}): import("react").JSX.Element;
//# sourceMappingURL=content-transition.d.ts.map