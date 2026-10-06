import { type HeadingDescriptor } from "@hjmds/design-contracts/components/heading";
import type { ReactNode } from "react";
import type { StyleProp, TextStyle } from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type HeadingProps = HeadingDescriptor & Readonly<{
    children: ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw text style bypasses `headingRecipe`. Use `layoutStyle` for placement and
     * `level` for size/weight. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<TextStyle>;
}>;
export declare function Heading({ level, semanticLevel, children, layoutStyle, style }: HeadingProps): import("react").JSX.Element;
//# sourceMappingURL=heading.d.ts.map