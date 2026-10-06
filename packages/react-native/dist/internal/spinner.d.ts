import { type StyleProp, type ViewStyle } from "react-native";
import type { HjmCompositionStyleProp } from "../composition-style.js";
export type SpinnerProps = Readonly<{
    label: string;
    size?: "small" | "large";
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and `size` for appearance.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Spinner({ label, size, style, layoutStyle }: SpinnerProps): import("react").JSX.Element;
//# sourceMappingURL=spinner.d.ts.map