import { type ReactNode } from "react";
export type GridRevealProps = Readonly<{
    ready: boolean;
    active?: boolean;
    children: ReactNode;
}>;
/** Connect ready to Image.onLoadStatusChange; the image retains loading/error/accessibility. */
export declare function GridReveal({ ready, active, children }: GridRevealProps): import("react").JSX.Element;
//# sourceMappingURL=grid-reveal.d.ts.map