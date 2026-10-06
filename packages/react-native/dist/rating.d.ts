import { type RatingDescriptor } from "@hjmds/design-contracts/reference-controls";
export type RatingProps = RatingDescriptor & Readonly<{
    getValueLabel: (value: number | null) => string;
    disabled?: boolean;
    clearLabel?: string;
}> & (Readonly<{
    readOnly: true;
    onValueChange?: never;
}> | Readonly<{
    readOnly?: false;
    onValueChange: (value: number | null) => void;
}>);
export declare function Rating(props: RatingProps): import("react").JSX.Element;
//# sourceMappingURL=rating.d.ts.map