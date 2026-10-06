import { type ImageComparisonDescriptor } from "@hjmds/design-contracts/reference-controls";
export type ImageComparisonProps = ImageComparisonDescriptor & Readonly<{
    onValueChange: (value: number) => void;
    getValueText: (value: number) => string;
    disabled?: boolean;
    decrementLabel: string;
    incrementLabel: string;
}>;
export declare function ImageComparison(props: ImageComparisonProps): import("react").JSX.Element;
//# sourceMappingURL=image-comparison.d.ts.map