import { type HeadingDescriptor } from "@hjmds/design-contracts/components/heading";
import type { ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type HeadingProps = HeadingDescriptor & Readonly<{
    children: ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Heading({ level, semanticLevel, children, layoutStyle }: HeadingProps): import("react").JSX.Element;
//# sourceMappingURL=heading.d.ts.map