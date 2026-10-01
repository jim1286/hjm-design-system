import { type DurationFieldLabels, type DurationRange } from "@hjmds/design-contracts/duration-field";
export type DurationFieldProps = DurationRange & Readonly<{
    value: number;
    onValueChange: (seconds: number) => void;
    labels: DurationFieldLabels;
    disabled?: boolean;
}>;
export declare function DurationField({ value, onValueChange, labels, min, max, disabled }: DurationFieldProps): import("react").JSX.Element;
//# sourceMappingURL=duration-field.d.ts.map