import { type BottomInfoDescriptor } from "@hjmds/design-contracts/components/bottom-info";
import type { ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type BottomInfoProps = BottomInfoDescriptor & Readonly<{
    renderItem?: (item: string, index: number) => ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
     * `bottomInfoRecipe` owns appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;
export declare function BottomInfo({ items, tone, renderItem, layoutStyle, style }: BottomInfoProps): import("react").JSX.Element;
//# sourceMappingURL=bottom-info.d.ts.map