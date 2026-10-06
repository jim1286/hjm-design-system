import { type RatingDescriptor } from "@hjmds/design-contracts/reference-controls";
export type RatingProps = RatingDescriptor & Readonly<{
    /** Product-localized score and unrated text, also used as the radio name. */
    getValueLabel: (value: number | null) => string;
    disabled?: boolean;
    clearLabel?: string;
    name?: string;
}> & (Readonly<{
    readOnly: true;
    onValueChange?: never;
}> | Readonly<{
    readOnly?: false;
    onValueChange: (value: number | null) => void;
}>);
/** Controlled score input, with a distinct non-interactive average representation. */
export declare function Rating(props: RatingProps): import("react").JSX.Element;
//# sourceMappingURL=rating.d.ts.map