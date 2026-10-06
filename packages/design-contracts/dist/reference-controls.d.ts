export type RatingDescriptor = Readonly<{
    label: string;
    value: number | null;
    max?: number;
    readOnly?: boolean;
}>;
/** A bounded row remains a rating rather than an unbounded repeated-icon list.
 * Null means unrated; zero and fractional averages are meaningful only in read-only summaries. */
export declare function resolveRating({ label, value, max, readOnly }: RatingDescriptor): {
    max: number;
    value: number | null;
    fractions: number[];
};
export type ComparisonImage = Readonly<{
    src: string;
    width: number;
    height: number;
    label: string;
}>;
export type ImageComparisonDescriptor = Readonly<{
    label: string;
    before: ComparisonImage;
    after: ComparisonImage;
    value: number;
}>;
/** Both pictures share one coordinate system. Reject mismatched aspect ratios
 * instead of silently stretching or cropping the evidence being compared. */
export declare function resolveImageComparison({ label, before, after, value }: ImageComparisonDescriptor): {
    aspectRatio: number;
    fraction: number;
};
//# sourceMappingURL=reference-controls.d.ts.map