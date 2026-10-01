import { type DurationFieldLabels, type DurationRange } from "@hjmds/design-contracts/duration-field";
export type DurationFieldProps = DurationRange & Readonly<{
    value: number;
    onValueChange: (seconds: number) => void;
    labels: DurationFieldLabels;
    disabled?: boolean;
    className?: string;
}>;
/** A NumberField composition; value and limits always use whole seconds. */
export declare function DurationField({ value, onValueChange, labels, min, max, disabled, className }: DurationFieldProps): import("react").JSX.Element;
//# sourceMappingURL=duration-field.d.ts.map