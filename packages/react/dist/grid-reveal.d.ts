import { type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type GridRevealProps = Readonly<{
    ready: boolean;
    active?: boolean;
    children: ReactNode; /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Connect ready to Image.onLoadStatusChange; the image retains loading/error/accessibility. */
export declare function GridReveal({ ready, active, children, layoutStyle }: GridRevealProps): import("react").JSX.Element;
//# sourceMappingURL=grid-reveal.d.ts.map