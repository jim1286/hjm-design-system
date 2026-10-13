import type { HjmCompositionStyleProp } from "../composition-style.js";
export type SpinnerProps = Readonly<{
    label: string;
    size?: "small" | "large";
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Spinner({ label, size, layoutStyle }: SpinnerProps): import("react").JSX.Element;
//# sourceMappingURL=spinner.d.ts.map