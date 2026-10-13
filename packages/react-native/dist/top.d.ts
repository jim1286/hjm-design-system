import { type TopDescriptor } from "@hjmds/design-contracts/components/top";
import type { ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type TopProps = Readonly<{
    descriptor: TopDescriptor;
    /** Secondary action sharing the title row; stacks below it at large text. */
    trailing?: ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Top({ descriptor, trailing, layoutStyle }: TopProps): import("react").JSX.Element;
//# sourceMappingURL=top.d.ts.map