import { type BottomInfoDescriptor } from "@hjmds/design-contracts/components/bottom-info";
import type { ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type BottomInfoProps = BottomInfoDescriptor & Readonly<{
    renderItem?: (item: string, index: number) => ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function BottomInfo({ items, tone, renderItem, layoutStyle }: BottomInfoProps): import("react").JSX.Element;
//# sourceMappingURL=bottom-info.d.ts.map