import { type ReactNode } from "react";
export type GridRevealProps = Readonly<{
    ready: boolean;
    active?: boolean;
    children: ReactNode;
}>;
/** Decorative mask only; the host Image owns load/error and the accessible description. */
export declare function GridReveal({ ready, active, children }: GridRevealProps): import("react").JSX.Element;
//# sourceMappingURL=grid-reveal.d.ts.map