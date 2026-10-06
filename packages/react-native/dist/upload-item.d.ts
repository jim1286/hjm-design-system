import { type UploadItemDescriptor, type UploadItemLabels } from "@hjmds/design-contracts/components/upload-item";
import type { ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type UploadItemProps = Readonly<{
    descriptor: UploadItemDescriptor;
    labels: UploadItemLabels;
    onCancel?: (id: string) => void;
    onRetry?: (id: string) => void;
    leading?: ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
     * `uploadItemRecipe` owns appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;
export declare function UploadItem({ descriptor, labels, onCancel, onRetry, leading, layoutStyle, style }: UploadItemProps): import("react").JSX.Element;
//# sourceMappingURL=upload-item.d.ts.map