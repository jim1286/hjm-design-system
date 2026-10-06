import { type TopDescriptor } from "@hjmds/design-contracts/components/top";
import type { ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type TopProps = Readonly<{
    descriptor: TopDescriptor;
    /** Secondary action sharing the title row; stacks below it at large text. */
    trailing?: ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
     * `topRecipe` owns appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;
export declare function Top({ descriptor, trailing, layoutStyle, style }: TopProps): import("react").JSX.Element;
//# sourceMappingURL=top.d.ts.map