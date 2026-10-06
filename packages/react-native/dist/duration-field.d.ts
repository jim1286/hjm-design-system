import { type DurationFieldLabels, type DurationRange } from "@hjmds/design-contracts/duration-field";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type DurationFieldProps = DurationRange & Readonly<{
    value: number;
    onValueChange: (seconds: number) => void;
    labels: DurationFieldLabels;
    disabled?: boolean;
    /** Canonical layout-only placement on the root, matching Web DurationField (added 2026-10-06; Native had no placement prop). */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function DurationField({ value, onValueChange, labels, min, max, disabled, layoutStyle }: DurationFieldProps): import("react").JSX.Element;
//# sourceMappingURL=duration-field.d.ts.map