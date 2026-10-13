import { type DurationFieldLabels, type DurationRange } from "@hjmds/design-contracts/duration-field";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type DurationFieldProps = DurationRange & Readonly<{
    value: number;
    onValueChange: (seconds: number) => void;
    labels: DurationFieldLabels;
    disabled?: boolean;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Units and limits remain in seconds; FieldGroup owns grouping and edit lifetime. */
export declare function DurationField({ value, onValueChange, labels, min, max, disabled, layoutStyle }: DurationFieldProps): import("react").JSX.Element;
//# sourceMappingURL=duration-field.d.ts.map