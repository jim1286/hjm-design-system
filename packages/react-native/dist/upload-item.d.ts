import { type UploadItemDescriptor, type UploadItemLabels } from "@hjmds/design-contracts/components/upload-item";
import type { ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type UploadItemProps = Readonly<{
    descriptor: UploadItemDescriptor;
    labels: UploadItemLabels;
    onCancel?: (id: string) => void;
    onRetry?: (id: string) => void;
    leading?: ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function UploadItem({ descriptor, labels, onCancel, onRetry, leading, layoutStyle }: UploadItemProps): import("react").JSX.Element;
//# sourceMappingURL=upload-item.d.ts.map