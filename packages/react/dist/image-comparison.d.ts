import { type ImageComparisonDescriptor } from "@hjmds/design-contracts/reference-controls";
export type ImageComparisonProps = ImageComparisonDescriptor & Readonly<{
    onValueChange: (value: number) => void;
    getValueText: (value: number) => string;
    disabled?: boolean;
}>;
/** Reuse Slider for drag/keyboard/commit semantics. The image divider is a
 * visual projection, not a second competing gesture or focus target. */
export declare function ImageComparison(props: ImageComparisonProps): import("react").JSX.Element;
//# sourceMappingURL=image-comparison.d.ts.map