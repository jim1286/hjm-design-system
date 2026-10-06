import { type DurationFieldLabels, type DurationRange } from "@hjmds/design-contracts/duration-field";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type DurationFieldProps = DurationRange & Readonly<{
    value: number;
    onValueChange: (seconds: number) => void;
    labels: DurationFieldLabels;
    disabled?: boolean;
    className?: string; /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** A NumberField composition; value and limits always use whole seconds. */
export declare function DurationField({ value, onValueChange, labels, min, max, disabled, className, layoutStyle }: DurationFieldProps): import("react").JSX.Element;
//# sourceMappingURL=duration-field.d.ts.map