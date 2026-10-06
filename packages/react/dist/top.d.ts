import { type TopDescriptor } from "@hjmds/design-contracts/components/top";
import { type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type TopProps = Readonly<{
    descriptor: TopDescriptor;
    /** Secondary action sharing the title row; drops below it when space runs out. */
    trailing?: ReactNode;
    className?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Top: import("react").ForwardRefExoticComponent<Readonly<{
    descriptor: TopDescriptor;
    /** Secondary action sharing the title row; drops below it when space runs out. */
    trailing?: ReactNode;
    className?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLElement>>;
//# sourceMappingURL=top.d.ts.map